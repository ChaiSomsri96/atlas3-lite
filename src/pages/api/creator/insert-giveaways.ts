import type { NextApiRequest, NextApiResponse } from "next";

/*
import prisma from "@/backend/lib/prisma";
import {
  BlockchainNetwork,
  CollabType,
  GiveawayStatus,
  GiveawayType,
  ProjectPhase,
  ProjectRoleType,
  ProjectStatus,
} from "@prisma/client";
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  /*
  const _giveaways = [];
  for (let i = 0; i < 24; i++) {
    _giveaways.push({
      name: `Test ${i}`,
      slug: `test-${i}`,
      description: `test ${i} project description`,
      type: GiveawayType.FCFS,
      status: GiveawayStatus.RUNNING,
      endsAt: new Date(),
      projectId: '63b5458624952ef79ef695db',
      maxWinners: 10,
      ownerId: '63dba98d1409bdcd09b5e546',
      collabType: CollabType.GIVE_SPOTS,
      collabProjectId: '63dc98fe48c47f77adf58bb0',
      collabDuration: 12  
    });
  }

  const giveaways = await prisma.$transaction(
    _giveaways.map((giveaway) => prisma.giveaway.create({ data: giveaway }))
  )
  const giveawayIds = giveaways.map((giveaway) => giveaway.id);

  const _entries = [];
  for (const giveawayId of giveawayIds) {
    _entries.push({
      userId: "63dbaa7af981ae3127361500",
      walletAddress: "594WQxpBu4vVDhhW2K7QoNMZaN6j9znxajcZX13as7HD",
      giveawayId,
      entryAmount: 10,
    });
  }
  await prisma.giveawayEntry.createMany({ data: _entries });

  await prisma.giveaway.deleteMany({
    where: {
      description:{
        startsWith: 'test '
      }
    }
  })
  */

  res.status(200).json({});
}
