import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  totalForgeStaked: number;
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

  // get all users forgeStaked where greater than 0 and sum
  const totalForgeStaked = await prisma.user.aggregate({
    _sum: {
      forgeStaked: true,
    },
    where: {
      forgeStaked: {
        gt: 0,
      },
    },
  });

  /*const users = await prisma.user.findMany({
    where: {
      forgeStaked: {
        gt: 0,
      },
    },
  });*/

  res
    .status(200)
    .json({ totalForgeStaked: totalForgeStaked._sum.forgeStaked ?? 0 });
}
