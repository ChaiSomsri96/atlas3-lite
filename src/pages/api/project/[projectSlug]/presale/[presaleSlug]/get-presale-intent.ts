import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { PresaleEntryIntent } from "@prisma/client";

export type GetPresaleIntentRequestResponseData = {
  intent: PresaleEntryIntent;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetPresaleIntentRequestResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { presaleSlug } = req.query;
  const { intentId } = JSON.parse(req.body);

  if (!presaleSlug) {
    return res.status(400).json({ message: "Missing presaleSlug" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "Presale not found" });
  }

  const intent = await prisma.presaleEntryIntent.findFirst({
    where: {
      id: intentId as string,
    },
  });

  if (!intent) {
    return res.status(404).json({ message: "Intent not found" });
  }

  res.status(200).json({ intent });
}