import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

export type PendingWithdrawalResponse = {
  success: boolean;
  error: string;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PendingWithdrawalResponse | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get pending withdrawal
  const pendingWithdrawal = await prisma.userPointsWithdrawHistory.findFirst({
    where: {
      userId: session.user.id,
      processed: false,
    },
  });

  res
    .status(200)
    .json({
      success: pendingWithdrawal ? true : false,
      error: pendingWithdrawal?.error ? pendingWithdrawal.error : "",
    });
}
