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
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug } = req.query;
  const { userId } = JSON.parse(req.body);

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // only the main admin can remove users
  if (project.roles[0].userId !== session.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const userRole = project.roles.find((role) => role.userId === userId);

  if (!userRole) return res.status(404).json({ message: "Role not found" });

  if (userId === session.user.id) {
    return res.status(500).json({ message: "You can't remove yourself" });
  }

  const roleToDelete = project.roles.find((role) => role.userId === userId);

  if (!roleToDelete) {
    return res.status(404).json({ message: "Role not found" });
  }

  const filteredRoles = project.roles.filter((role) => role.userId !== userId);

  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      roles: {
        set: filteredRoles,
      },
    },
  });

  res.status(200).json({ project: updatedProject });
}
