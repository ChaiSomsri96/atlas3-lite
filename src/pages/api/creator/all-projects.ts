import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { ExtendedProject } from "./owned-projects";
import { BlockchainNetwork, Prisma, ProjectStatus } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { OAuthProviders } from "@/shared/types";
import cache from "@/backend/lib/redis/cache";
import { fetchUserGuilds } from "../me/joined-projects";

type ResponseData = {
  projects: ExtendedProject[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { page, pageLength, search, sortOption, filterOptions, notMine } =
    req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    network?: {
      in: BlockchainNetwork[];
    };
    status?: {
      in: ProjectStatus[];
    };
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };

    OR?: {
      discordGuild?: {
        isSet: boolean;
      };
      verified?: boolean;
    }[];

    discordGuild?: {
      isNot?: {
        id: {
          in: string[];
        };
      };
    };
  } = {};

  if (notMine == "1") {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userDiscordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: OAuthProviders.DISCORD,
      },
    });

    if (userDiscordAccount) {
      const accessToken = userDiscordAccount.access_token;
      if (!accessToken) {
        return res.status(500).json({ message: "Missing access token" });
      }

      const userDiscordGuildIds = await cache.fetch(
        `discordGuildIds:${userDiscordAccount.id}`,
        () => fetchUserGuilds(accessToken),
        2 * 60 // 2 minutes
      );

      where.discordGuild = {
        isNot: {
          id: {
            in: userDiscordGuildIds,
          },
        },
      };
    }
  }

  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      const networks: BlockchainNetwork[] = [];
      const statuses: ProjectStatus[] = [];

      for (const option of _filterOptions) {
        if (option.startsWith("network_")) {
          const network = option.split("network_")[1];
          networks.push(network as BlockchainNetwork);
        }
        if (option.startsWith("status_")) {
          const status = option.split("status_")[1];
          statuses.push(status as ProjectStatus);
        }
      }

      if (networks.length > 0) {
        where.network = { in: networks };
      }
    }
  }

  if (search) {
    where.name = {
      contains: search as string,
      mode: "insensitive",
    };
  }

  const orderBy: {
    name?: Prisma.SortOrder;
    rank?: Prisma.SortOrder;
  } = {};

  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "name") {
      orderBy.name = sortOrder;
    }

    if (sortBy == "trending") {
      orderBy.rank = sortOrder;
    }
  }

  where.status = {
    in: ["PUBLISHED"],
  };

  if (!where.discordGuild?.isNot) {
    where.OR = [
      {
        discordGuild: {
          isSet: true,
        },
      },
      {
        verified: true,
      },
    ];
  }

  const total = await prisma.project.count({
    where,
  });
  let projects = await prisma.project.findMany({
    where,

    include: {
      _count: {
        select: {
          giveaways: true,
        },
      },
      allowlist: {
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      },
    },
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  projects = projects.sort((a, b) => Number(b.verified) - Number(a.verified));
  //projects = projects.sort((x, y) => !!y.imageUrl - !!x.imageUrl);

  res.status(200).json({ projects, total });
}
