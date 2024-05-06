import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { Prisma, Project, ProjectStatus } from "@prisma/client";

type ResponseData = {
  collections: Project[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { search, limit } = req.query;

  const where: {
    status: ProjectStatus;
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
  } = {
    status: ProjectStatus.PUBLISHED,
  };

  if (search) {
    where.name = {
      contains: search as string,
      mode: "insensitive",
    };
  }

  const collections = await prisma.project.findMany({
    take: limit ? parseInt(limit as string) : undefined,
    where,
    orderBy: {
      name: "asc",
    },
  });

  res.status(200).json({ collections });
}
