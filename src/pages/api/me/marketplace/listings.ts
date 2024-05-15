import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  AllowlistEntry,
  MarketplaceRecord,
  Project,
  TradeType,
} from "@prisma/client";

export type MarketplaceRecordData = {
  project: Project;
  allowlistEntry: AllowlistEntry | null;
  userEntry: AllowlistEntry | null;
} & MarketplaceRecord;

type MarketplaceResponseData = {
  records: MarketplaceRecordData[];
  total: number;
  allowlistTradingEnabled: boolean;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectId } = req.body;
  const { page, pageLength } = req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
    select: {
      allowlistTradingEnabled: true,
    },
  });

  const total = await prisma.marketplaceRecord.count({
    where: {
      listed: true,
      processed: false,
      tradeType: TradeType.SELL,
      projectId: projectId,
    },
  });

  const records = await prisma.marketplaceRecord.findMany({
    where: {
      listed: true,
      processed: false,
      tradeType: TradeType.SELL,
      projectId: projectId,
    },
    include: {
      project: true,
      allowlistEntry: true,
    },
    orderBy: {
      pointCost: "asc",
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  // get allowlist for project
  const allowlist = await prisma.allowlist.findFirst({
    where: {
      projectId: projectId,
    },
  });

  // get allowlist entry
  const entry = await prisma.allowlistEntry.findFirst({
    where: {
      userId: session.user.id,
      allowlistId: allowlist?.id,
    },
  });

  // add allowlist entries to records
  const recordsWithAllowlist = records.map((record) => {
    return {
      ...record,
      userEntry: entry,
    };
  });

  res
    .status(200)
    .json({
      records: recordsWithAllowlist,
      total,
      allowlistTradingEnabled: project?.allowlistTradingEnabled ?? false,
    });
}
