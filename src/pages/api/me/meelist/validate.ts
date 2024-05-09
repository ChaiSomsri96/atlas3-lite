import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import {
  GiveawayEntry,
  GiveawayRuleType,
  TwitterFriendshipRuleType,
} from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { checkApplicationRules } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";

export type ValidateGiveawayEntryResponseData = {
  isSuccess: boolean;
  results: RuleResult[];
  entry?: GiveawayEntry | undefined;
};

const rules = [
  {
    type: GiveawayRuleType.TWITTER_FRIENDSHIP,
    twitterFriendshipRule: {
      relationships: [TwitterFriendshipRuleType.FOLLOW],
      username: "meegosNFT",
    },
    id: "application1",
    minimumBalanceRule: null,
    ownNftRule: null,
    twitterTweetRule: null,
    discordRoleRule: null,
    discordGuildRule: null,
  },
  {
    type: GiveawayRuleType.TWITTER_FRIENDSHIP,
    twitterFriendshipRule: {
      relationships: [TwitterFriendshipRuleType.FOLLOW],
      username: "MeeListed",
    },
    id: "application2",
    minimumBalanceRule: null,
    ownNftRule: null,
    twitterTweetRule: null,
    discordRoleRule: null,
    discordGuildRule: null,
  },
  {
    id: "application4",
    type: GiveawayRuleType.DISCORD_GUILD,
    discordGuildRule: {
      guildId: "1092520240811868241",
      guildName: "Meegos",
      guildInvite: "https://discord.gg/meegos",
    },
    minimumBalanceRule: null,
    ownNftRule: null,
    twitterFriendshipRule: null,
    twitterTweetRule: null,
    discordRoleRule: null,
  },
];

type GiveawayEntryErrorData = {
  message: string;
};

export async function validateApplication({ userId }: { userId: string }) {
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

  const { results, errorMessage, isSuccess } = await checkApplicationRules(
    rules,
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

  console.log("here");

  try {
    const data = await validateApplication({
      userId: session.user.id,
    });

    return res
      .status(200)
      .json({ isSuccess: data.isSuccess, results: data.results });
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ message: (ex as Error).message });
  }
}
