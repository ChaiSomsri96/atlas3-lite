import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import {
  BlockchainNetwork,
  Giveaway,
  GiveawayStatus,
  Prisma,
  ProjectStatus,
} from "@prisma/client";

type ResponseData = {
  giveaways: Giveaway[];
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

  const { page, pageLength, search, sortOption, filterOptions } = req.query;

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    project: {
      status: ProjectStatus;

      network?: {
        in: BlockchainNetwork[];
      };
      OR?: {
        discordGuild?: {
          isSet: boolean;
        };
        verified?: boolean;
      }[];
    };
    status: GiveawayStatus;
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
    settings: {
      is: {
        private: boolean;
      };
    };
  } = {
    project: {
      status: ProjectStatus.PUBLISHED,

      OR: [
        {
          discordGuild: {
            isSet: true,
          },
        },
        {
          verified: true,
        },
      ],
    },

    status: GiveawayStatus.RUNNING,
    settings: {
      is: {
        private: false,
      },
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
        where.project.network = { in: networks };
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
    entryCount?: Prisma.SortOrder;
  } = {
    entryCount: "desc",
  };

  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "entryCount") {
      orderBy.entryCount = sortOrder;
    }
  }

  const total = await prisma.giveaway.count({
    where,
  });
  const giveaways = await prisma.giveaway.findMany({
    where,
    include: {
      project: true,
      collabProject: true,
    },
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  console.log(total);

  res.status(200).json({ giveaways, total });
}
