import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Giveaway, GiveawayStatus, Prisma } from "@prisma/client";

type ResponseData = {
  giveaways: Giveaway[];
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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    projectSlug,
    projectId,
    sortOption,
    page,
    pageLength,
    filterOptions,
    search,
  } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  if (!projectId) return res.status(400).json({ message: "Missing projectId" });

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    OR: {
      collabProjectId?: string;
      projectId?: string;
    }[];

    status?: {
      in?: GiveawayStatus[];
      not?: GiveawayStatus;
    };
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
  } = {
    OR: [
      {
        projectId: projectId as string,
      },
      {
        collabProjectId: projectId as string,
      },
    ],
    status: {
      not: GiveawayStatus.COLLAB_PENDING,
    },
  };

  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      const statuses: GiveawayStatus[] = [];

      for (const option of _filterOptions) {
        if (option.startsWith("status_")) {
          const status = option.split("status_")[1];
          statuses.push(status as GiveawayStatus);
        }
      }

      if (statuses.length > 0) {
        where.status = { in: statuses, not: GiveawayStatus.COLLAB_PENDING };
      }
    }
  }

  if (search) {
    where.name = {
      contains: search as string,
      mode: "insensitive",
    };
  }

  const orderBy: Prisma.GiveawayOrderByWithRelationInput[] = [];

  orderBy.push({ status: "desc" });
  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "endsAt") {
      orderBy.push({ endsAt: sortOrder });
    }
  }

  // get giveaways
  const [total, giveaways] = await Promise.all([
    prisma.giveaway.count({ where }),
    prisma.giveaway.findMany({
      where,
      include: {
        collabProject: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            slug: true,
          },
        },
        paymentToken: true,
        withdraw: true,
      },
      orderBy,
      skip: _pageLength * _page,
      take: _pageLength,
    }),
  ]);

  return res.status(200).json({ giveaways, total });
}
