import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { GiveawayStatus } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { OAuthProviders } from "@/shared/types";

export type ValidateGiveawayEntryResponseData = {
  isSuccess: boolean;
};

type MemberInfo = {
  roles: string[];
};

type GiveawayEntryErrorData = {
  message: string;
};

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
    const giveaway = await prisma.giveaway.findUnique({
      where: {
        slug: giveawaySlug as string,
      },
      include: {
        collabProject: {
          include: {
            allowlist: true,
          },
        },
      },
    });

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    if (giveaway.status !== GiveawayStatus.RUNNING) {
      return res.status(400).json({ message: "Giveaway is not running" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = user.wallets.find(
      (w) => w.network === giveaway.network && w.isDefault
    );

    if (!wallet) {
      return res
        .status(404)
        .json({ message: `Default wallet for ${giveaway.network} not found` });
    }

    const userDiscordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: OAuthProviders.DISCORD,
      },
    });

    if (!userDiscordAccount) {
      return res
        .status(403)
        .json({ message: "Please link a discord account." });
    }

    if (giveaway.collabProject && giveaway.collabProject.allowlist) {
      // check if user has allowlist entry
      const allowlistEntry = await prisma.allowlistEntry.findFirst({
        where: {
          allowlistId: giveaway.collabProject.allowlist.id,
          userId: session.user.id,
        },
      });

      if (
        allowlistEntry &&
        allowlistEntry.role &&
        allowlistEntry.role.id === giveaway.discordRoleId
      ) {
        return res
          .status(403)
          .json({ message: "You already have an allowlist for this project." });
      }
    }

    if (giveaway.discordServerId && giveaway.discordServerId !== "") {
      // Fetch Discord Guild Information from the Discord API
      const userDiscordGuildsRes = await fetch(
        `https://discord.com/api/guilds/${giveaway.discordServerId}/members/${userDiscordAccount.providerAccountId}`,
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          },
        }
      );

      const userDiscordGuilds: MemberInfo = await userDiscordGuildsRes.json();

      if (!userDiscordGuildsRes.ok) {
        return res.status(403).json({
          message: "Please join the discord before entering this giveaway.",
        });
      }

      if (!userDiscordGuilds) {
        return res.status(403).json({
          message: "Please join the discord before entering this giveaway.",
        });
      }
    }

    return res.status(200).json({ isSuccess: true });
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ message: (ex as Error).message });
  }
}
