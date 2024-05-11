import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import {
  BlockchainNetwork,
  Prisma,
  Project,
  ProjectPhase,
  ProjectStatus,
} from "@prisma/client";
import { addMonths } from "date-fns";

type ResponseData = {
  projects: Project[];
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

  const { upcomingYear, upcomingMonth, sortOption, filterOptions } = req.query;
  if (!upcomingYear || !upcomingMonth) {
    return res.status(400).json({ message: "No upcoming date" });
  }

  const startDate = new Date(
    parseInt(upcomingYear as string),
    parseInt(upcomingMonth as string),
    0
  );
  const endDate = addMonths(startDate, 1);

  const where: {
    mintDate: {
      lt: Date;
      gte: Date;
    };
    phase?: {
      in: ProjectPhase[];
    };
    network?: {
      in: BlockchainNetwork[];
    };
    status?: {
      in: ProjectStatus[];
    };
  } = {
    mintDate: {
      gte: startDate,
      lt: endDate,
    },
  };

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

  where.status = {
    in: ["PUBLISHED"],
  };

  where.phase = {
    in: ["PREMINT"],
  };

  const projects = await prisma.project.findMany({
    where,
    orderBy,
  });

  console.log(projects.length);

  res.status(200).json({ projects });
}
