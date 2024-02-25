import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { unstable_getServerSession } from "next-auth";
import { Project, UserType } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

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
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (
    session.user.type !== UserType.MASTER &&
    session.user.type !== UserType.ADMIN
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { projectSlug } = req.query;
  const { twitterUsername } = JSON.parse(req.body);

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const updatedProject = await prisma.project.update({
    where: {
      slug: projectSlug as string,
    },
    data: {
      verified: true,
      twitterUsername,
    },
  });

  return res.status(200).json({ project: updatedProject });
}
