import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { Prisma } from "@prisma/client";
import { ExtendedProject } from "../creator/owned-projects";

type ResponseData = {
  projects: ExtendedProject[] | null;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  /*
  const featuredProjects = await prisma.project.findMany({
    select: {
      id: true,
    },
    where: {
      isFeatured: true,
    },
    take: 100,
    orderBy: {
      name: Prisma.SortOrder.asc,
    },
  });

  const projectIds = featuredProjects.map((project) => project.id);

  const firstPremintProject = await prisma.project.findFirst({
    select: {
      id: true,
    },
    where: {
      phase: ProjectPhase.PREMINT,
      votes: {
        gt: 0,
      },
    },
    orderBy: {
      votes: Prisma.SortOrder.desc,
    },
  });
  if (firstPremintProject) {
    projectIds.push(firstPremintProject.id);
  }

  if (projectIds.length == 0) {
    res.status(200).json({ project: null });
  }

  const randId = projectIds[Math.floor(Math.random() * projectIds.length)];
  const project = await prisma.project.findFirst({
    where: {
      id: randId,
    },
  });
  */

  const projects = await prisma.project.findMany({
    where: {
      isFeatured: true,
    },
    take: 100,
    orderBy: {
      name: Prisma.SortOrder.asc,
    },
  });

  res.status(200).json({ projects });
}
