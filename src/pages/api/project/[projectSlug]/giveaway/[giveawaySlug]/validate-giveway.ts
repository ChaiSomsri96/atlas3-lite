import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { GiveawayEntry, GiveawayStatus, GiveawayType } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { checkAllRules } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";

export type ValidateGiveawayEntryResponseData = {
  isSuccess: boolean;
  results: RuleResult[];
  entry?: GiveawayEntry | undefined;
};

type GiveawayEntryErrorData = {
  message: string;
};

export async function validateGiveaway({
  giveawaySlug,
  givewayId,
  userId,
}: {
  giveawaySlug?: string;
  givewayId?: string;
  userId: string;
}) {
  let where = {};
  if (giveawaySlug) {
    where = {
      slug: giveawaySlug,
    };
  } else if (givewayId) {
    where = {
      id: givewayId,
    };
  }

  const giveaway = await prisma.giveaway.findFirst({
    where,
    include: {
      project: true,
    },
  });

  if (!giveaway) {
    throw Error("Giveaway not found");
  }

  if (giveaway.status !== GiveawayStatus.RUNNING) {
    throw Error("Giveaway is not running");
  }
  if (giveaway.type !== GiveawayType.RAFFLE) {
    throw Error("Only valid for raffle giveaways");
  }

  /*const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });*/

  const accounts = await prisma.account.findMany({
    where: {
      userId: userId,
    },
  });

  if (!accounts || accounts.length === 0) {
    throw Error("User not found");
  }

  const { results, errorMessage, isSuccess } = await checkAllRules(
    giveaway,
    accounts
  );

  if (errorMessage) {
    throw Error(errorMessage);
  }

  return { results, isSuccess };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ValidateGiveawayEntryResponseData | GiveawayEntryErrorData
  >
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { giveawaySlug } = req.query;
  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  try {
    const data = await validateGiveaway({
      giveawaySlug: giveawaySlug as string,
      userId: session.user.id,
    });

    return res
      .status(200)
      .json({ isSuccess: data.isSuccess, results: data.results });
  } catch (ex) {
    return res.status(500).json({ message: (ex as Error).message });
  }
}
