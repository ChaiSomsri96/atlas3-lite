import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { PaymentToken, Prisma } from "@prisma/client";

type ResponseData = {
  paymentTokens: PaymentToken[];
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

  const paymentTokens = await prisma.paymentToken.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      tokenName: Prisma.SortOrder.asc,
    },
  });

  res.status(200).json({ paymentTokens });
}
