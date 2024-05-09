import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Presale, PresaleStatus, Prisma } from "@prisma/client";

type ResponseData = {
  presales: Presale[];
  total: number;
  totalEntryCount: number;
  totalRevenue: number;
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
    projectId?: string;
    status?: {
      in?: PresaleStatus[];
    };
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
  } = { projectId: projectId as string};


  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      const statuses: PresaleStatus[] = [];

      for (const option of _filterOptions) {
        if (option.startsWith("status_")) {
          const status = option.split("status_")[1];
          statuses.push(status as PresaleStatus);
        }
      }
    }
  }

  if (search) {
    where.name = {
      contains: search as string,
      mode: "insensitive",
    };
  }

  const orderBy: Prisma.PresaleOrderByWithRelationInput[] = [];

  orderBy.push({ status: "desc" });
  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "endsAt") {
      orderBy.push({ endsAt: sortOrder });
    }
  }

   // get giveaways, aggregated data, and all presales for totalRevenue calculation
   const [total, presales, aggregatedData, allPresales] = await Promise.all([
    prisma.presale.count({ where }),
    prisma.presale.findMany({
      where,
      include: {
        project: {
          select: {
            slug: true,
          },
        },
      },
      orderBy,
      skip: _pageLength * _page,
      take: _pageLength,
    }),
    prisma.presale.aggregate({
      where,
      _sum: {
        entryCount: true,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.presale.findMany({
      where,
      select: {
        entryCount: true,
        pointsCost: true,
      },
    }),
  ]);

  const totalEntryCount = aggregatedData._sum.entryCount;
  const totalRevenue = allPresales.reduce(
    (acc, presale) => acc + presale.entryCount * presale.pointsCost,
    0
  );

  return res
    .status(200)
    .json({ presales, total, totalEntryCount: totalEntryCount ?? 0 , totalRevenue });
}
