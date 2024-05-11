import { isUserAdmin, isUserManager } from "@/backend/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { AllowlistEntry, User } from "@prisma/client";
import prisma from "@/backend/lib/prisma";
export type ExtendedAllowlistEntry = AllowlistEntry & {
  user: User | null;
};

type ResponseData = {
  entries: ExtendedAllowlistEntry[];
  total: number;
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

  const { projectSlug, page, pageLength } = req.query;

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          entries: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where = {
    allowlistId: project.allowlist.id,
  };

  const total = await prisma.allowlistEntry.count({
    where,
  });
  const entries = await prisma.allowlistEntry.findMany({
    where,
    include: {
      user: true,
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  return res.status(200).json({ entries, total });
}
