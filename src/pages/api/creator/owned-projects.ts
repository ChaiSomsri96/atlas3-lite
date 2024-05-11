import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Allowlist, AllowlistEntry, Project } from "@prisma/client";

export type ExtendedAllowlist = Allowlist & {
  _count?: {
    entries: number | null;
  };
  entries?: AllowlistEntry[];
};

export type ExtendedProject = Project & {
  allowlist?: ExtendedAllowlist | null;
  giveawaysCount?: number;
  allowlistCount?: number;
};

type ResponseData = {
  projects: ExtendedProject[];
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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const projects = await prisma.project.findMany({
    where: {
      roles: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  res.status(200).json({ projects });
}
