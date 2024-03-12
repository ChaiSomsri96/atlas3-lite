import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { ProjectRoleType } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  inviteUrl: string;
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
  const { type } = JSON.parse(req.body);

  if (!type || !Object.keys(ProjectRoleType).includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const userRole = project.roles.find(
    (role) => role.userId === session.user.id
  );

  if (!userRole || userRole.type !== ProjectRoleType.ADMIN) {
    return res.status(404).json({ message: "Forbidden" });
  }

  const invite = await prisma.projectRoleInvite.create({
    data: {
      project: {
        connect: {
          id: project.id,
        },
      },
      type: type as ProjectRoleType,
    },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL}/api/creator/project/${project.slug}/team/accept-invite?inviteId=${invite.id}`;

  res.status(200).json({ inviteUrl });
}
