import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

type ResponseData = {
  signatures: string[];
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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { signatures } = req.body;

  const transactions = await prisma.userPointsDepositHistory.findMany({
    where: {
      txSignature: {
        in: signatures,
      },
    },
    select: {
      txSignature: true,
    },
  });

  const processedSignatures = transactions.map((t) => t.txSignature);

  res.status(200).json({ signatures: processedSignatures });
}
