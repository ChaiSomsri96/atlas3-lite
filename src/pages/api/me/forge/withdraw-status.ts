import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

export type PendingWithdrawStatusResponseData = {
  processing: boolean;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingWithdrawStatusResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get pending withdrawal
  const pendingWithdrawal = await prisma.userForgeWithdrawHistory.findFirst({
    where: {
      userId: session.user.id,
      processed: false,
    },
  });

  res.status(200).json({
    processing: pendingWithdrawal ? true : false,
  });
}
