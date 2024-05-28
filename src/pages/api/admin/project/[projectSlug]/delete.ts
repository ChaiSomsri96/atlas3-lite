import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { UserType } from "@prisma/client";

type ResponseData = {
  success: boolean;
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

  if (session.user.type !== UserType.MASTER) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { projectSlug } = req.query;

  if (!projectSlug || projectSlug === "") {
    return res.status(400).json({ message: "Missing projectSlug" });
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

  if (project.allowlist) {
    // get allowlist entries for this project and delete
    await prisma.allowlistEntry.deleteMany({
      where: {
        allowlistId: project.allowlist?.id,
      },
    });

    // delete allowlist
    await prisma.allowlist.delete({
      where: {
        id: project.allowlist?.id,
      },
    });
  }
  // delete all giveaways for this project
  await prisma.giveaway.deleteMany({
    where: {
      projectId: project.id,
    },
  });

  await prisma.giveaway.deleteMany({
    where: {
      collabProjectId: project.id,
    },
  });

  // delete project
  await prisma.project.delete({
    where: {
      id: project.id,
    },
  });

  res.status(200).json({ success: true });
}
