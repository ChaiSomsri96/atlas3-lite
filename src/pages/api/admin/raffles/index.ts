import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { Giveaway } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

type ResponseData = {
  raffles: Giveaway[];
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

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const raffles = await prisma.giveaway.findMany({
    where: {
      adminCreated: true,
    },
    include: {
      project: true,
    },
    orderBy: {
      endsAt: "desc",
    },
  });

  res.status(200).json({ raffles });
}
