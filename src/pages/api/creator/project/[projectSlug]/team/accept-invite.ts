import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { ProjectRole } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized. Not logged in." });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug, inviteId } = req.query;

  if (!inviteId) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const invite = await prisma.projectRoleInvite.findUnique({
    where: {
      id: inviteId as string,
    },
  });

  if (!invite) {
    return res.status(404).json({ message: "Invite not found" });
  }

  if (invite.projectId !== project.id) {
    return res.status(404).json({ message: "Invite not found" });
  }

  // automatically expires after 24 hours
  if (invite.createdAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    return res.status(404).json({ message: "Invite not found" });
  }

  const userRole = project.roles.find(
    (role) => role.userId === session.user.id
  );

  if (userRole) {
    return res.status(500).json({ message: "User already has role" });
  }

  const role: ProjectRole = {
    userId: session.user.id,
    type: invite.type,
  };

  await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      roles: {
        push: role,
      },
    },
  });

  await prisma.projectRoleInvite.delete({
    where: {
      id: invite.id,
    },
  });

  res.redirect(
    `/creator/project/${project.slug}/manage-team?success=invite-accepted`
  );
}
