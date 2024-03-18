import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { GiveawayEntry } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  entry: GiveawayEntry;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { giveawaySlug } = req.query;

  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  const giveaway = await prisma.giveaway.findFirst({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      project: true,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
      giveawayEntries: {
        where: {
          giveawayId: giveaway.id,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.giveawayEntries.length === 0) {
    return res
      .status(400)
      .json({ message: "User has already entered giveaway" });
  }

  const entry = await prisma.giveawayEntry.delete({
    where: {
      id: user.giveawayEntries[0].id,
    },
  });

  return res.status(200).json({ entry });
}
