import type { NextApiRequest, NextApiResponse } from "next";
import { Lottery } from "@prisma/client";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const lottery = await prisma.lottery.findFirst({
    where: {
      status: "RUNNING",
    },
  });

  if (!lottery) {
    return res.status(404).json({ message: "No running lottery found" });
  }

  res.status(200).json({ lottery });
}
