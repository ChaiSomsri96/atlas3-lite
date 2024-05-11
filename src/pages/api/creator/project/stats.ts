import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { CollabType, GiveawayStatus } from "@prisma/client";

export type ProjectStatsData = {
  outgoing: {
    receiveCount: number;
    offerCount: number;
    totalCount: number;
  };
  incoming: {
    receiveCount: number;
    offerCount: number;
    totalCount: number;
  };
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProjectStatsData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectId } = req.query;

  const [
    outgoingReceiveCount,
    outgoingOfferCount,
    incomingReceiveCount,
    incomingOfferCount,
  ] = await Promise.all([
    prisma.giveaway.count({
      where: {
        collabType: CollabType.RECEIVE_SPOTS,
        projectId: projectId as string,
        status: GiveawayStatus.COLLAB_PENDING,
      },
    }),
    prisma.giveaway.count({
      where: {
        collabType: CollabType.GIVE_SPOTS,
        projectId: projectId as string,
        status: GiveawayStatus.COLLAB_PENDING,
      },
    }),
    prisma.giveaway.count({
      where: {
        collabType: CollabType.GIVE_SPOTS,
        collabProjectId: projectId as string,
        status: GiveawayStatus.COLLAB_PENDING,
      },
    }),
    prisma.giveaway.count({
      where: {
        collabType: CollabType.RECEIVE_SPOTS,
        collabProjectId: projectId as string,
        status: GiveawayStatus.COLLAB_PENDING,
      },
    }),
  ]);

  res.status(200).json({
    outgoing: {
      receiveCount: outgoingReceiveCount,
      offerCount: outgoingOfferCount,
      totalCount: outgoingReceiveCount + outgoingOfferCount,
    },
    incoming: {
      receiveCount: incomingReceiveCount,
      offerCount: incomingOfferCount,
      totalCount: incomingReceiveCount + incomingOfferCount,
    },
  });
}
