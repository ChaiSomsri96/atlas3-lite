import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { Giveaway, GiveawayEntry, Project } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  giveaway: {
    project: Project | null;
    entries?: GiveawayEntry[];
  } & Giveaway;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  const { giveawaySlug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log(req.query);

  let giveaway;
  let entries;
  if (session) {
    giveaway = await prisma.giveaway.findUnique({
      where: {
        slug: giveawaySlug as string,
      },
      include: {
        project: true,
        collabProject: true,
        paymentToken: true,
      },
    });

    const entry = await prisma.giveawayEntry.findFirst({
      where: {
        userId: session.user.id,
        giveawayId: giveaway?.id,
      },
    });

    entries = entry ? [entry] : undefined;
  } else {
    giveaway = await prisma.giveaway.findUnique({
      where: {
        slug: giveawaySlug as string,
      },
      include: {
        project: true,
        collabProject: true,
        paymentToken: true,
      },
    });
  }

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  res.status(200).json({ giveaway: { ...giveaway, entries: entries || [] } });
}
