import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Project, ProjectStatus } from "@prisma/client";
import { isUserAdmin } from "@/backend/utils";

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

  const { projectSlug } = req.query;

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

  if (project.status !== ProjectStatus.DRAFT) {
    return res.status(400).json({ message: "Project is not a draft" });
  }

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  /*if (!project.discordGuild?.id) {
    return res.status(400).json({
      message:
        "You must connect a Discord Server to your project before publishing.",
    });
  */

  /*if (!project.twitterUsername) {
    return res.status(400).json({
      message: "You must connect a Twitter account to your project before publishing.",
    });
  }*/

  /*if (project.phase === "PREMINT" && !project.allowlist) {
    return res
      .status(400)
      .json({ message: "You must add an allowlist before publishing." });
  }*/

  const updatedProject = await prisma.project.update({
    where: {
      slug: projectSlug as string,
    },
    data: {
      status: ProjectStatus.PUBLISHED,
    },
  });

  res.status(200).json({ project: updatedProject });
}
