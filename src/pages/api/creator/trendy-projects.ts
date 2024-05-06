import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { ExtendedProject } from "./owned-projects";
import { BlockchainNetwork } from "@prisma/client";

type ResponseData = {
  projects: ExtendedProject[];
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

  const { network, all } = req.query;
  let projects: ExtendedProject[] = [];

  if (all === "true") {
    // get top 6 projects with most runningGiveaways ordered descending
    projects = await prisma.project.findMany({
      where: { verified: true },
      orderBy: { runningGiveaways: "desc" },
      take: 6,
    });
  } else {
    projects = await prisma.project.findMany({
      where: {
        network: network as BlockchainNetwork,
        verified: true,
      },
      orderBy: { runningGiveaways: "desc" },
      take: 6,
    });
  }

  res.status(200).json({ projects });
}
