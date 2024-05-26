import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { Stats } from "@prisma/client";

type ResponseData = {
  stats: Stats | null;
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

  console.log("here");

  const stats = await prisma.stats.findFirst();

  return res.status(200).json({ stats: stats });
}
