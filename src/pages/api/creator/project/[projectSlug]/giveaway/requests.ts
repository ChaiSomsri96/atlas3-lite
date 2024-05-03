import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  BlockchainNetwork,
  CollabType,
  Giveaway,
  GiveawayStatus,
  Prisma,
} from "@prisma/client";

type ResponseData = {
  requests: Giveaway[];
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
    collabType,
    sortOption,
    page,
    pageLength,
    filterOptions,
    search,
  } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const _collabType = collabType as CollabType;
  const where: {
    collabProjectId?: string;
    projectId?: string;
    collabType: CollabType;
    project?: {
      is: {
        network?: {
          in: BlockchainNetwork[];
        };
      };
    };
    status?: {
      in: GiveawayStatus[];
    };
    name?: {
      contains: string;
      mode: Prisma.QueryMode;
    };
  } = {
    collabType: _collabType,
    projectId: project.id,
  };

  console.log(_collabType);

  if (filterOptions) {
    const _filterOptions = (filterOptions as string).split(",");
    if (_filterOptions.length > 0) {
      const networks: BlockchainNetwork[] = [];
      const statusArr: GiveawayStatus[] = [];

      for (const option of _filterOptions) {
        if (option.startsWith("network_")) {
          const network = option.split("network_")[1];
          networks.push(network as BlockchainNetwork);
        }

        if (option.startsWith("status_")) {
          const status = option.split("status_")[1];
          statusArr.push(status as GiveawayStatus);
        }
      }

      if (networks.length > 0) {
        where.project = {
          is: {
            network: {
              in: networks,
            },
          },
        };
      }
      if (statusArr.length > 0) {
        where.status = { in: statusArr };
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
    endsAt?: Prisma.SortOrder;
    entries?: {
      _count: Prisma.SortOrder;
    };
    status: Prisma.SortOrder;
  } = {
    status: "asc",
  };

  if (sortOption) {
    const sortBy = (sortOption as string).split("_")[0];
    const sortOrder = (sortOption as string).split("_")[1] as Prisma.SortOrder;

    if (sortBy == "endsAt") {
      orderBy.endsAt = sortOrder;
    } else if (sortBy == "entries") {
      orderBy.entries = {
        _count: sortOrder,
      };
    }
  }

  // get giveaways
  const total = await prisma.giveaway.count({
    where,
  });
  const requests = await prisma.giveaway.findMany({
    where,
    include: { collabProject: true, project: true, owner: true },
    orderBy,
    skip: _pageLength * _page,
    take: _pageLength,
  });

  return res.status(200).json({ requests, total });
}
