import type { NextApiRequest, NextApiResponse } from "next";
import { Lottery } from "@prisma/client";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  lottery: Lottery | null;
  exists: boolean;
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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const lottery = await prisma.lottery.findFirst({
    where: {
      status: "FINALIZED",
    },
    include: {
      winners: true,
    },
    orderBy: {
      endsAt: "desc",
    },
  });

  res.status(200).json({ lottery, exists: lottery !== null });
}
