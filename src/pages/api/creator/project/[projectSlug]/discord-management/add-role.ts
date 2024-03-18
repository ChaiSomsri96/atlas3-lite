import { isUserAdmin, isUserManager } from "@/backend/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";
import { addRole } from "@/backend/utils/addRole";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type BulkAddRolesResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkAddRolesResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;
  const { userId, roleId } = JSON.parse(req.body);

  if (!userId) {
    return res.status(400).json({ message: "Missing usernames" });
  }

  if (!roleId) {
    return res.status(400).json({ message: "Missing roleId" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.discordGuild) {
    return res.status(400).json({ message: "Project has no Discord guild" });
  }

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let addRoleResult = await addRole(project.discordGuild.id, userId, roleId);

  if (addRoleResult && addRoleResult.message === "Missing Permissions") {
    return res.status(403).json({
      message:
        "Missing Permissions. Make sure bot is placed above the role you are trying to assign in your server settings.",
    });
  }

  while (
    addRoleResult &&
    addRoleResult.message &&
    addRoleResult.message === "You are being rate limited."
  ) {
    await sleep(addRoleResult.retry_after);
    addRoleResult = await addRole(project.discordGuild.id, userId, roleId);
  }

  return res.status(200).json({ success: true });
}
