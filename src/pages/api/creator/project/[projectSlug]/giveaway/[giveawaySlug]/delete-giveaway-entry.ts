import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { GiveawayEntry } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { isUserAdmin, isUserManager } from "@/backend/utils";

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
  const { userId } = JSON.parse(req.body);

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

  if (
    !isUserAdmin(giveaway?.project, session.user.id) &&
    !isUserManager(giveaway?.project, session.user.id)
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const giveawayEntry = await prisma.giveawayEntry.findFirst({
    where: {
      giveawayId: giveaway.id,
      userId: userId,
    },
  });

  if (!giveawayEntry) {
    return res.status(404).json({ message: "Giveaway Entry not found" });
  }

  const deletedEntry = await prisma.giveawayEntry.delete({
    where: {
      id: giveawayEntry.id,
    },
  });

  return res.status(200).json({ entry: deletedEntry });
}
