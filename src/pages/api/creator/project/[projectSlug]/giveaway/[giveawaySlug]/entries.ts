import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { GiveawayEntry, Prisma } from "@prisma/client";

type ResponseData = {
  entries: GiveawayEntry[];
  total: number;
};

type ErrorData = {
  message: string;
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

  const {
    projectSlug,
    giveawaySlug,
    sortOption,
    page,
    pageLength,
    filterOptions,
    search,
  } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }
  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  // get giveaway id from giveaway slug
  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    select: {
      id: true,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    OR?: {
      isWinner?:
        | boolean
        | {
            isSet: boolean;
          };
    }[];
    giveawayId: string;
    user?: {
      name: {
        contains: string;
        mode: Prisma.QueryMode;
      };
    };
  } = {
    giveawayId: giveaway.id,
  };

  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      for (const option of _filterOptions) {
        if (option == "status_WIN") {
          where.OR = [
            ...(where.OR ?? []),
            {
              isWinner: true,
            },
          ];
        } else if (option == "status_LOST") {
          where.OR = [
            ...(where.OR ?? []),
            {
              isWinner: {
                isSet: false,
              },
            },
          ];
        }
      }
    }
  }

  if (search) {
    where.user = {
      name: {
        contains: search as string,
        mode: "insensitive",
      },
    };
  }

  const orderBy: {
    user?: {
      name: Prisma.SortOrder;
    };
  } = {};

  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "name") {
      orderBy.user = {
        name: sortOrder,
      };
    }
  }

  // get entries
  const total = await prisma.giveawayEntry.count({
    where,
  });
  const entries = await prisma.giveawayEntry.findMany({
    where,

    include: {
      user: {
        include: {
          accounts: true,
        },
      },
    },
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  return res.status(200).json({ entries, total });
}
