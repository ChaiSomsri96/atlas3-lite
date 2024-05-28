import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { Project } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

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

  const { oldProjectSlug, newProjectSlug } = JSON.parse(req.body);

  const project = await prisma.project.findUnique({
    where: {
      slug: oldProjectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const projectNew = await prisma.project.findUnique({
    where: {
      slug: newProjectSlug as string,
    },
  });

  if (projectNew) {
    return res
      .status(409)
      .json({ message: "Project with this slug already exists" });
  }

  const updatedProject = await prisma.project.update({
    where: {
      slug: oldProjectSlug as string,
    },
    data: {
      slug: newProjectSlug as string,
    },
  });

  return res.status(200).json({ project: updatedProject });
}
