import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { OAuthProviders } from "@/shared/types";
import cache from "@/backend/lib/redis/cache";
import { ExtendedProject } from "../creator/owned-projects";
import {
  Account,
  BlockchainNetwork,
  Prisma,
  ProjectPhase,
  ProjectStatus,
} from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  projects: ExtendedProject[];
  total: number;
};

type ErrorData = {
  message: string;
};

export const fetchUserGuilds = async (
  accessToken: string,
  userDiscordAccount: Account,
  secondTime: boolean
): Promise<string[]> => {
  const userDiscordGuilds = await fetch(
    `https://discord.com/api/users/@me/guilds`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!userDiscordGuilds.ok) {
    // refresh token

    if (secondTime) {
      throw new Error("Error fetching user guilds");
    }

    const body = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      grant_type: "refresh_token",
      refresh_token: userDiscordAccount.refresh_token ?? "",
    }).toString();

    const refreshedTokens = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body,
      }
    ).then((res) =>
      res.json().catch((ex) => {
        console.log(ex);
      })
    );

    if (refreshedTokens && refreshedTokens.access_token) {
      await prisma.account.update({
        where: {
          id: userDiscordAccount.id,
        },
        data: {
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
        },
      });
    }

    return fetchUserGuilds(
      refreshedTokens.access_token,
      userDiscordAccount,
      true
    );
  }

  const userDiscordGuildsJson = await userDiscordGuilds.json();

  const userDiscordGuildIds = userDiscordGuildsJson.map(
    (guild: { id: string }) => guild.id
  );

  return userDiscordGuildIds;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { sortOption, filterOptions, page, pageLength } = req.query;

  const userDiscordAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: OAuthProviders.DISCORD,
    },
  });

  if (!userDiscordAccount) {
    return res.json({ projects: [], total: 0 });
  }

  const accessToken = userDiscordAccount.access_token;

  if (!accessToken) {
    return res.status(500).json({ message: "Missing access token" });
  }

  const userDiscordGuildIds = await cache.fetch(
    `discordGuildIds:${userDiscordAccount.id}`,
    () => fetchUserGuilds(accessToken, userDiscordAccount, false),
    2 * 60 // 2 minutes
  );

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    status: ProjectStatus;
    phase: ProjectPhase;
    discordGuild: {
      is: {
        id: {
          in: string[];
        };
      };
    };
    network?: {
      in: BlockchainNetwork[];
    };
    allowlist?: {
      OR: [{ enabled: true }, { enabled: false }];
    };
  } = {
    status: ProjectStatus.PUBLISHED,
    phase: ProjectPhase.PREMINT,
    discordGuild: {
      is: {
        id: {
          in: userDiscordGuildIds,
        },
      },
    },
    allowlist: {
      OR: [{ enabled: true }, { enabled: false }],
    },
  };

  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      const networks: BlockchainNetwork[] = [];

      for (const option of _filterOptions) {
        if (option.startsWith("network_")) {
          const network = option.split("network_")[1];
          networks.push(network as BlockchainNetwork);
        }
      }

      if (networks.length > 0) {
        where.network = { in: networks };
      }
    }
  }

  const orderBy: {
    name?: Prisma.SortOrder;
  } = {};

  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "name") {
      orderBy.name = sortOrder;
    }
  }

  const total = await prisma.project.count({
    where,
  });
  const projects = await prisma.project.findMany({
    where,
    include: {
      allowlist: {
        include: {
          entries: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  res.status(200).json({ projects, total });
}
