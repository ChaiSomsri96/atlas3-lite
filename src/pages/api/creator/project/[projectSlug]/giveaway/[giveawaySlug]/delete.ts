import { isUserAdmin, isUserManager } from "@/backend/utils";
import { Giveaway, GiveawayStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";

type ResponseData = {
  giveaway: Giveaway;
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

  const { projectSlug, giveawaySlug } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      project: true,
    },
  });

  if (giveaway?.status === GiveawayStatus.FINALIZED) {
    return res
      .status(400)
      .json({ message: "Can't delete a giveaway which is finished." });
  }

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }
  if (
    !isUserAdmin(giveaway.project, session.user.id) &&
    !isUserManager(giveaway.project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await prisma.giveawayEntry.deleteMany({
    where: {
      giveawayId: giveaway.id,
    },
  });

  // call API to delete post in discord
  if (giveaway.discordMessageId) {
    try {
      fetch(
        `${process.env.GIVEAWAYBOT_API}/delete?giveawaySlug=${giveaway.slug}`,
        {
          method: "GET",
        }
      );
    } catch (e) {
      console.log("Error deleting giveaway in discord", e);
    }
  }

  // create activity log record
  await prisma.activityLog.create({
    data: {
      type: "GIVEAWAY_DELETED",
      relatedId: giveaway.id,
      userId: session.user.id,
      relatedDescription: giveaway.name
    },
  });

  const deletedGiveaway = await prisma.giveaway.delete({
    where: {
      slug: giveawaySlug as string,
    },
  });

  return res.status(200).json({ giveaway: deletedGiveaway });
}
