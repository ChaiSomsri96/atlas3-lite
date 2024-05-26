import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { OAuthProviders } from "@/shared/types";

type ResponseData = {
  allocation: number;
  wallets: string[];
};

type ErrorData = {
  message: string;
};

type MemberInfo = {
  roles: string[];
};

const getUserRoles = async (serverId: string, userId: string) => {
  // Fetch Discord Guild Information from the Discord API
  const userDiscordGuildsRes = await fetch(
    `https://discord.com/api/guilds/${serverId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const userDiscordGuilds: MemberInfo = await userDiscordGuildsRes.json();

  if (!userDiscordGuildsRes.ok) {
    return {
      message:
        "Error fetching discord servers, please relink your discord through your profile.",
    };
  }

  if (!userDiscordGuilds) {
    return { message: "You are not in the server." };
  }

  return { roles: userDiscordGuilds.roles };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: "smyths",
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
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
      .json({ message: "Please link a discord account to your profile" });
  }

  let allocation = 0;

  const ombRed = "1115814217098993756"; // 2 alloc
  const ombBlue = "1115814363379552276"; // 2 alloc
  const ombSet = "1115814432623296595"; // 8 alloc
  const ombDubRed = "1116740829000777861"; // 4 alloc
  const ombDubBlue = "1116741021108293703"; // 4 alloc
  const ombDubSet = "1116741166130528276"; // 16 alloc
  const ombServerId = "1080982966995521607"; // omb server id

  const userRoles = await getUserRoles(
    ombServerId,
    userDiscordAccount.providerAccountId
  );

  if (userRoles && userRoles.message) {
    return res.status(403).json({ message: userRoles.message });
  }

  // 2 alloc
  if (
    userRoles &&
    userRoles.roles &&
    (userRoles.roles.includes(ombRed) || userRoles.roles.includes(ombBlue))
  ) {
    allocation = 2;
  }

  // 4 alloc
  if (
    userRoles &&
    userRoles.roles &&
    (userRoles.roles.includes(ombDubRed) ||
      userRoles.roles.includes(ombDubBlue))
  ) {
    allocation = 4;
  }

  // 8 alloc
  if (userRoles && userRoles.roles && userRoles.roles.includes(ombSet)) {
    allocation = 8;
  }

  // 16 alloc
  if (userRoles && userRoles.roles && userRoles.roles.includes(ombDubSet)) {
    allocation = 16;
  }

  // check if user already has allocation
  const user = await prisma.userOMB.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  res.status(200).json({ allocation, wallets: user?.wallets ?? [] });
}
