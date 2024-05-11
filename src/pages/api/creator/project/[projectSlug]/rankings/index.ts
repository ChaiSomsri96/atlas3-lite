import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Prisma, ProjectPhase } from "@prisma/client";
import { ProjectRanking } from "@/frontend/hooks/useProjectRankings";
import { addMonths, startOfMonth } from "date-fns";

type ResponseData = {
  rankings: ProjectRanking[];
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

  const { projectSlug, page, pageLength } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          entries: true,
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const where: {
    phase: ProjectPhase;
    projectId: string;
    createdAt?: {
      gte: Date;
      lt: Date;
    };
  } = {
    phase: project.phase,
    projectId: project.id,
  };

  if (project.phase == ProjectPhase.PREMINT) {
    const firstDay = startOfMonth(Date.now());
    const lastDay = addMonths(firstDay, 1);
    console.log(firstDay, lastDay);

    where.createdAt = {
      gte: firstDay,
      lt: lastDay,
    };
  }

  // get rankings
  const total = await prisma.projectVoteEntry.count({
    where,
  });

  const rankings = await prisma.projectVoteEntry.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: {
      votes: Prisma.SortOrder.desc,
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  const rankingsResponse = rankings.map((ranking) => {
    return {
      ...ranking,
      user: ranking.user,
      entry: project?.allowlist?.entries?.find(
        (x) => x.userId === ranking.user.id
      ),
    };
  });

  return res.status(200).json({ rankings: rankingsResponse, total });
}
