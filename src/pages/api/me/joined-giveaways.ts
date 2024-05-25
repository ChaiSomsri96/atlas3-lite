import type { NextApiRequest, NextApiResponse } from "next";
import {
  Giveaway,
  Prisma,
  GiveawayEntry,
  GiveawayStatus,
} from "@prisma/client";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  giveaways: (Giveaway & { entries: GiveawayEntry[] })[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { page, pageLength } = req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const entries = await prisma.giveawayEntry.findMany({
    where: {
      userId: userId,
      giveaway: {
        status: GiveawayStatus.RUNNING,
      },
    },
    include: {
      giveaway: {
        include: {
          project: true,
          collabProject: true,
        },
      },
    },
    skip: _pageLength * _page,
    take: _pageLength,
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  const total = await prisma.giveawayEntry.count({
    where: {
      userId: userId,
      giveaway: {
        status: GiveawayStatus.RUNNING,
      },
    },
  });

  // reverse the mapping
  const giveawaysMap = new Map();
  entries.forEach((entry) => {
    if (entry.giveaway) {
      const giveaway = entry.giveaway;
      if (giveawaysMap.has(giveaway.id)) {
        giveawaysMap.get(giveaway.id).entries.push(entry);
      } else {
        giveawaysMap.set(giveaway.id, { ...giveaway, entries: [entry] });
      }
    }
  });

  const giveaways = Array.from(giveawaysMap.values());

  res.status(200).json({ giveaways, total });
}
