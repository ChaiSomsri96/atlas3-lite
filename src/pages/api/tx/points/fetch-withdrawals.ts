import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { User, UserPointsWithdrawHistory } from "@prisma/client";

type ExtendedUserPointWithdrawTransaction = {
  user: User;
} & UserPointsWithdrawHistory;

type ResponseData = {
  withdrawals: ExtendedUserPointWithdrawTransaction[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const tx_listener_key = req.headers["tx-listener-key"];
  if (tx_listener_key != (process.env.TX_LISTENER_KEY as string)) {
    return res.status(401).json({ message: "Not allowed" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const withdrawals = await prisma.userPointsWithdrawHistory.findMany({
    where: {
      processed: false,
      processing: false,
    },
    include: {
      user: true,
    },
  });

  withdrawals.forEach((withdrawal) => {
    withdrawal.user.points = withdrawal.user.points / 1000;
  });

  // loop through withdrawals, where points are > 1000 then update userPointsWithdrawHistory and set error
  for (const withdrawal of withdrawals) {
    if (withdrawal.user.points > 1000) {
      await prisma.userPointsWithdrawHistory.update({
        where: {
          id: withdrawal.id,
        },
        data: {
          error: "User has more than 1000 points",
        },
      });
    }
  }

  // filter withdrawals where points are more than 1000
  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.user.points < 1000
  );

  res.status(200).json({ withdrawals: filteredWithdrawals });
}
