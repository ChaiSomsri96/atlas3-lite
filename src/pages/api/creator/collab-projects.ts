import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import {
  BlockchainNetwork,
  Prisma,
  Project,
  ProjectStatus,
} from "@prisma/client";

type ResponseData = {
  projects: Project[];
  total: number;
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

  const { page, pageLength, search } = req.query;

  console.log(search);

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    network?: {
      in: BlockchainNetwork[];
    };
    status?: {
      in: ProjectStatus[];
    };
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };

    OR?: {
      discordGuild?: {
        isSet: boolean;
      };
      verified?: boolean;
    }[];

    discordGuild?: {
      isNot?: {
        id: {
          in: string[];
        };
      };
    };
  } = {};

  if (search) {
    where.name = {
      contains: search as string,
      mode: "insensitive",
    };
  }

  const orderBy: {
    rank?: Prisma.SortOrder;
  } = {
    rank: "desc",
  };

  where.status = {
    in: ["PUBLISHED"],
  };

  if (!where.discordGuild?.isNot) {
    where.OR = [
      {
        discordGuild: {
          isSet: true,
        },
      },
      {
        verified: true,
      },
    ];
  }

  const total = await prisma.project.count({
    where,
  });
  const projects = await prisma.project.findMany({
    where,
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  res.status(200).json({ projects, total });
}
