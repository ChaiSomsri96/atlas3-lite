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
  const stats = await prisma.stats.findFirst();

  if (!stats) {
    return res.status(404).json({ message: "Stats not found" });
  }

  const runningRaffles = await prisma.giveaway.count({
    where: {
      adminCreated: true,
      status: "RUNNING",
    },
  });

  const runningApplications = await prisma.projectApplications.count({
    where: {
      active: true,
    },
  });

  await prisma.stats.update({
    where: {
      id: stats.id,
    },
    data: {
      runningRaffles,
      runningApplications,
    },
  });

  return res.status(200).json({ success: true });
}
