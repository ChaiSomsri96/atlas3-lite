import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { GiveawayStatus, Lottery, UserType } from "@prisma/client";

type ResponseData = {
  lottery: Lottery;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (session.user.type !== UserType.MASTER) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const lottery = await prisma.lottery.findUnique({
    where: {
      id: id as string,
    },
  });

  if (!lottery) {
    return res.status(404).json({ message: "lottery not found" });
  }

  const updatedLottery = await prisma.lottery.update({
    where: {
      id: id as string,
    },
    data: {
      status: GiveawayStatus.FINALIZED,
      endsAt: new Date(),
    },
  });

  res.status(200).json({ lottery: updatedLottery });
}
