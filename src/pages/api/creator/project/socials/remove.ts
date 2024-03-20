import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { isUserAdmin } from "@/backend/utils";
import { Project, ProjectStatus } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { ProjectSocials } from "@/shared/types";

type SuccessData = {
  project: Project;
};

type ErrorData = {
  message: string;
};

const deleteDiscordBot = async (project: Project) => {
  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      status: ProjectStatus.DRAFT,
      discordGuild: {
        unset: true,
      },
    },
  });

  return updatedProject;
};

const deleteTwitter = async (project: Project) => {
  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      twitterUsername: null,
      verified: null,
    },
  });

  return updatedProject;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { provider, projectId } = JSON.parse(req.body);

  if (!projectId) {
    return res.status(400).json({ message: "Missing projectId" });
  }

  if (!provider) {
    return res.status(400).json({ message: "Missing provider" });
  }

  if (!Object.values(ProjectSocials).includes(provider)) {
    return res.status(400).json({ message: "Invalid provider" });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let updatedProject;
  switch (provider) {
    case ProjectSocials.TWITTER:
      updatedProject = await deleteTwitter(project);
      break;
    case ProjectSocials.DISCORD:
      updatedProject = await deleteDiscordBot(project);
      break;
    default:
      return res.status(400).json({ message: "Invalid provider" });
  }

  res.status(200).json({ project: updatedProject });
}
