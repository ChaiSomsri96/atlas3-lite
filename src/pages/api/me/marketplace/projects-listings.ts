import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Project } from "@prisma/client";

export type MarketplaceProjectListingData = {
  project: Project;
  openBuyOrders: number;
  openListings: number;
  floorPrice: number;
  volume: number | undefined;
  lastSale: number | undefined;
};

export type MarketplaceProjectListinResponseData = {
  records: MarketplaceProjectListingData[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceProjectListinResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { page, pageLength, search } = req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const projectVolumes = await prisma.marketplaceProjectVolume.findMany({
    where: {
      active: true,
      project: {
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      volume: "desc",
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  const total = await prisma.marketplaceProjectVolume.count({
    where: {
      active: true,
      project: {
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
    },
  });

  const results = projectVolumes.map((volume) => {
    return {
      project: volume.project,
      openBuyOrders: volume.buyCount,
      openListings: volume.listingCount,
      floorPrice: volume.floorPrice,
      volume: volume.volume,
      lastSale: volume.lastSale,
    };
  });

  res.status(200).json({ records: results, total });
}
