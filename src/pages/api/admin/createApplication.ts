import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import {
  ApplicationQuestion,
  GiveawayRuleType,
  TwitterFriendshipRuleType,
} from "@prisma/client";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const stats = await prisma.stats.findFirst();

  if (!stats) {
    return res.status(404).json({ message: "Stats not found" });
  }

  const questions: ApplicationQuestion[] = [
    {
      text: "What title describes your position in the ecosystem?",
      type: "pill",
      options: [
        "Founder",
        "Artist",
        "Developer",
        "UI/UX Designer",
        "Marketing",
        "Collab Manager",
        "Community Manager",
        "Moderator",
        "Alpha Caller",
        "Influencer",
        "Contributor",
        "Degen",
      ],
      required: true,
      rows: null,
      textBoxNumber: null,
    },
    {
      text: "Do you use lending platforms and if yes are you a lender or borrower?",
      type: "select",
      options: ["Lender", "Borrower", "Both"],
      required: true,
      rows: null,
      textBoxNumber: null,
    },
    {
      text: "Would you use an insurance platform if there was one?",
      type: "select",
      options: ["Yes", "No"],
      required: true,
      rows: null,
      textBoxNumber: null,
    },
    {
      text: "What community are you most proud of to be a member?",
      type: "text",
      required: true,
      rows: 1,
      textBoxNumber: null,
      options: [],
    },
    {
      text: "Why do you want to be Wooflisted? Be honest!",
      type: "text",
      required: true,
      rows: 4,
      textBoxNumber: null,
      options: [],
    },
    {
      text: "Nominate 3 people that you believe can bring most value to The Keepers (twitter handles)",
      type: "text",
      required: false,
      textBoxNumber: 3,
      rows: null,
      options: [],
    },
  ];

  const rules = [
    {
      type: GiveawayRuleType.TWITTER_FRIENDSHIP,
      twitterFriendshipRule: {
        relationships: [TwitterFriendshipRuleType.FOLLOW],
        username: "TheKeepersNFT",
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
        username: "TheWoofList",
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
        guildId: "1090264810513506364",
        guildName: "The Keepers",
        guildInvite: "https://discord.com/invite/thekeepers",
      },
      minimumBalanceRule: null,
      ownNftRule: null,
      twitterFriendshipRule: null,
      twitterTweetRule: null,
      discordRoleRule: null,
    },
  ];

  await prisma.projectApplications.create({
    data: {
      projectId: "645e81c710710f7aa4da6adf",
      questions: questions,
      requirements: rules,
      twitterUsername: "TheWoofList",
    },
  });

  return res.status(200).json({ success: true });
}
