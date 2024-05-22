import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import {
  MarketplaceActionType,
  MarketplaceRecord,
  TradeType,
} from "@prisma/client";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

async function updateMarketplaceProjectVolume(
  projectId: string,
  listings: MarketplaceRecord[],
  buys: MarketplaceRecord[]
) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activities = await prisma.marketplaceActivity.findMany({
    where: {
      action: MarketplaceActionType.SALE,
      createdAt: {
        gte: oneDayAgo,
      },
      marketplaceRecord: {
        projectId: projectId,
      },
    },
    include: {
      marketplaceRecord: {
        select: {
          pointCost: true,
        },
      },
    },
  });

  const latestActivity = await prisma.marketplaceActivity.findFirst({
    where: {
      action: MarketplaceActionType.SALE,
      marketplaceRecord: {
        projectId: projectId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      marketplaceRecord: {
        select: {
          pointCost: true,
        },
      },
    },
  });

  const pointCostSum = activities.reduce(
    (sum, activity) => sum + (activity.marketplaceRecord.pointCost || 0),
    0
  );

  const latestSale = latestActivity?.marketplaceRecord.pointCost || 0;

  let floorPrice = 0;
  const buyOrders = buys.filter((x) => x.projectId === projectId);
  const listingOrders = listings.filter((x) => x.projectId === projectId);

  if (listingOrders.length > 0) {
    floorPrice = Math.min(
      ...listingOrders
        .filter((x) => x.listed && x.tradeType === TradeType.SELL)
        .map((record) => record.pointCost)
    );
  }

  const existingRecord = await prisma.marketplaceProjectVolume.findUnique({
    where: {
      projectId: projectId,
    },
  });

  if (existingRecord) {
    await prisma.marketplaceProjectVolume.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        volume: pointCostSum,
        lastSale: latestSale,
        listingCount: listingOrders.length ?? 0,
        buyCount: buyOrders.length ?? 0,
        floorPrice: floorPrice ?? 0,
        active:
          listingOrders?.length > 0 || buyOrders.length > 0 || pointCostSum > 0,
      },
    });
  } else {
    if (listings?.length > 0 || buyOrders.length > 0 || pointCostSum > 0) {
      await prisma.marketplaceProjectVolume.create({
        data: {
          projectId: projectId,
          volume: pointCostSum,
          lastSale: latestSale,
          listingCount: listings ? listings.length : 0,
          buyCount: buyOrders.length ?? 0,
          floorPrice: floorPrice ?? 0,
          active:
            listingOrders?.length > 0 ||
            buyOrders.length > 0 ||
            pointCostSum > 0,
        },
      });
    }
  }
}

async function updateMarketplaceProjectVolumeForAllProjects() {
  //return true;

  const projectIds = ["6474d9a69c5ca7806cab5940"];

  // get listing count
  const listings = await prisma.marketplaceRecord.findMany({
    where: {
      listed: true,
      processed: false,
      tradeType: "SELL",
    },
  });

  const buys = await prisma.marketplaceRecord.findMany({
    where: {
      listed: true,
      processed: false,
      tradeType: "BUY",
    },
  });

  for (const projectId of projectIds) {
    // console.log(projectId);
    await updateMarketplaceProjectVolume(projectId, listings, buys);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  await updateMarketplaceProjectVolumeForAllProjects();

  return res.status(200).json({ success: true });
}
