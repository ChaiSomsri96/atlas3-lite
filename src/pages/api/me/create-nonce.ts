import type { NextApiRequest, NextApiResponse } from "next";
import { redis } from "@/backend/lib/redis";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { randomStringForEntropy } from "@stablelib/random";

type ResponseData = {
  nonce: string;
  walletAlreadyExists: boolean;
};

type ErrorData = {
  message: string;
};

export const createNonce = async (address: string) => {
  const nonce = randomStringForEntropy(48);
  if (!nonce || nonce.length < 8) {
    throw new Error("Error during nonce creation");
  }

  await redis.set(`nonce:${address}`, nonce, "EX", 60 * 5);

  return nonce;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address } = JSON.parse(req.body);

  if (!address) {
    return res.status(400).json({ message: "Missing address" });
  }

  const nonce = await createNonce(address);

  // TODO: check if wallet exists
  res.status(200).json({ nonce, walletAlreadyExists: false });
}
