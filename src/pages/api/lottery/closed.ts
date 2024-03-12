/*import type { NextApiRequest, NextApiResponse } from "next";
import { Lottery } from "@prisma/client";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  lotteries: Lottery[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const total = await prisma.lottery.count({
    where: {
      status: "FINALIZED",
    },
  });

  let lotteries;
  if (session) {
    lotteries = await prisma.lottery.findMany({
      where: {
        status: "FINALIZED",
      },
      include: {
        entries: {
          where: {
            isWinner: true,
          },
        },
      },
      orderBy: {
        endsAt: "desc",
      },
    });
  } else {
    lotteries = await prisma.lottery.findMany({
      where: {
        status: "FINALIZED",
      },
    });
  }

  res.status(200).json({ lotteries, total });
}
*/

export {};
