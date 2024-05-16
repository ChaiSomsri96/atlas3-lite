import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  MarketplaceActivity,
  MarketplaceRecord,
  Project,
  MarketplaceActionType,
} from "@prisma/client";

export type MarketplaceActivityData = {
  marketplaceRecord: {
    project: Project;
  } & MarketplaceRecord;
} & MarketplaceActivity;

export type MarketplaceActivityResponseData = {
  records: MarketplaceActivityData[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceActivityResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { page, pageLength, search } = req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  let whereCondition: {
    action: MarketplaceActionType;
    marketplaceRecord?: {
      projectId: {
        in: string[];
      };
    };
  } = {
    action: MarketplaceActionType.SALE,
  };

  if (search && search.length > 0) {
    // Fetch project IDs that match the search query
    const projects = await prisma.project.findMany({
      where: {
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    });

    const projectIds = projects.map((project) => project.id);

    whereCondition = {
      ...whereCondition,
      marketplaceRecord: {
        projectId: {
          in: projectIds,
        },
      },
    };
  }

  const total = await prisma.marketplaceActivity.count({
    where: whereCondition,
  });

  const records = await prisma.marketplaceActivity.findMany({
    where: whereCondition,
    include: {
      marketplaceRecord: {
        include: {
          project: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  res.status(200).json({ records, total });
}
