import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { MarketplaceRecord, Project, TradeType } from "@prisma/client";

type MarketplaceRecordData = {
  project: Project;
} & MarketplaceRecord;

type ResponseData = {
  records: MarketplaceRecordData[];
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

  const records = await prisma.marketplaceRecord.findMany({
    where: {
      processed: false,
      tradeType: TradeType.SELL,
      listed: true,
    },
    include: {
      project: true,
    },
  });

  res.status(200).json({ records });
}
