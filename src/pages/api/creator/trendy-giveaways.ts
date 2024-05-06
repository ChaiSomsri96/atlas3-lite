import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { Giveaway, GiveawayStatus } from "@prisma/client";

type ResponseData = {
  giveaways: Giveaway[];
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

  const giveaways = await prisma.giveaway.findMany({
    where: {
      status: GiveawayStatus.RUNNING,
    },
    include: {
      project: true,
      collabProject: true,
    },
    orderBy: {
      entryCount: "desc",
    },
    take: 6,
  });

  res.status(200).json({ giveaways });
}
