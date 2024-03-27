import { isUserAdmin, isUserManager } from "@/backend/utils";
import { AllowlistType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";
import { deleteRole } from "@/backend/utils/deleteRole";

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
  const { userId, purgeRoleId } = JSON.parse(req.body);

  if (!userId) {
    return res.status(400).json({ message: "Missing userIds" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: true,
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

  if (!project.allowlist) {
    return res.status(400).json({ message: "Project has no allowlist" });
  }

  if (project.allowlist.type !== AllowlistType.DISCORD_ROLE) {
    return res
      .status(400)
      .json({ message: "Project has no Discord allowlist" });
  }

  let deleteRoleResult = await deleteRole(
    project.discordGuild.id,
    userId,
    purgeRoleId
  );

  console.log(deleteRoleResult);

  if (deleteRoleResult && deleteRoleResult.message === "Missing Permissions") {
    return res.status(403).json({
      message:
        "Missing Permissions. Make sure bot is placed above the role you are trying to remove in your server settings.",
    });
  }

  while (
    deleteRoleResult &&
    deleteRoleResult.message &&
    deleteRoleResult.message === "You are being rate limited."
  ) {
    await sleep(deleteRoleResult.retry_after);
    deleteRoleResult = await deleteRole(
      project.discordGuild.id,
      userId,
      purgeRoleId
    );
  }

  return res.status(200).json({ success: true });
}
