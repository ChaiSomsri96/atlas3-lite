import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { AllowlistRole } from "@prisma/client";

type ResponseData = {
  roles: AllowlistRole[];
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

  const { projectId, projectSlug } = req.query;

  const project = await prisma.project.findUnique({
    where: {
      id: projectId as string,
      slug: projectSlug as string,
    },
    include: {
      allowlist: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  const roles = project.allowlist.roles;

  return res.status(200).json({ roles });
}
