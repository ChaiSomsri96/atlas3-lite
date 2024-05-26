import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

async function updateEntryCountsForRunningGiveaways(): Promise<void> {
  const runningGiveaways = await prisma.giveaway.findMany({
    where: { status: "RUNNING" },
    select: { id: true, entryCount: true, adminCreated: true },
  });

  for (const giveaway of runningGiveaways) {
    if (giveaway.adminCreated) {
      continue;
    }

    const entryCount = await prisma.giveawayEntry.count({
      where: { giveawayId: giveaway.id },
    });

    // if entry count is different
    if (entryCount === giveaway.entryCount) continue;

    await prisma.giveaway.update({
      where: { id: giveaway.id },
      data: { entryCount },
    });

    console.log(`Entry count updated for giveawayId: ${giveaway.id}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  // Call the function immediately
  await updateEntryCountsForRunningGiveaways();

  return res.status(200).json({ success: true });
}
