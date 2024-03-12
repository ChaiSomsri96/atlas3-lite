import type { NextApiRequest, NextApiResponse } from "next";
import { LotteryWinners } from "@prisma/client";

import prisma from "@/backend/lib/prisma";

type ResponseData = {
  winners: LotteryWinners[];
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

  const winners = await prisma.lotteryWinners.findMany({
    take: 100,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ winners });
}
