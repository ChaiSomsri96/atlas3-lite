import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

type ResponseData = {
  success: boolean;
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

  const { txSignature, withdrawId } = req.body;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!txSignature) {
    return res.status(400).json({ message: "Missing params" });
  }

  const withdraw = await prisma.userPointsWithdrawHistory.findUnique({
    where: {
      id: withdrawId,
    },
  });
  if (!withdraw) {
    return res.status(404).json({ message: "Withdraw not exists" });
  }

  await prisma.userPointsWithdrawHistory.update({
    where: {
      id: withdrawId,
    },
    data: {
      txSignature,
      processed: true,
      processing: false,
    },
  });

  // set user points to 0
  await prisma.user.update({
    where: {
      id: withdraw.userId,
    },
    data: {
      points: 0,
    },
  });

  res.status(200).json({ success: true });
}
