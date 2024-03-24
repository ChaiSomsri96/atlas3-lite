import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Project } from "@prisma/client";
import { isUserAdmin, isUserManager } from "@/backend/utils";

type ResponseData = {
  project: Project;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug } = req.query;
  const {
    rules,
    defaultRoleId,
    holderRules,
    incomingCollabsChannelId,
    incomingCollabsTagId,
    channelPostSettings,
    withdrawSOLAddress,
    winnerChannelId,
  } = JSON.parse(req.body);

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let updatedProject;
  if (project.discordGuild) {
    updatedProject = await prisma.project.update({
      where: {
        slug: projectSlug as string,
      },
      data: {
        defaultRules: rules,
        holderRules,
        defaultRoleId: defaultRoleId,
        channelPostSettings: channelPostSettings,
        discordGuild: {
          set: {
            id: project.discordGuild?.id ?? "",
            name: project.discordGuild?.name ?? "",
            incomingCollabsChannelId: incomingCollabsChannelId,
            incomingCollabsTagId: incomingCollabsTagId,
            winnerChannelId: winnerChannelId,
          },
        },
        withdrawSOLAddress,
      },
    });
  } else {
    updatedProject = await prisma.project.update({
      where: {
        slug: projectSlug as string,
      },
      data: {
        defaultRules: rules,
        holderRules,
        withdrawSOLAddress,
      },
    });
  }

  return res.status(200).json({ project: updatedProject });
}
