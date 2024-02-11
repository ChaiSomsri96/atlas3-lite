import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { MeeListApplications } from "@prisma/client";

type ResponseData = {
  applications: MeeListApplications[];
  total: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug } = req.query;

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

  if (project.slug === "meegos") {
    // total
    const total = await prisma.meeListApplications.count({
      where: {
        status: "APPROVED",
        posted: false,
      },
    });

    const applications = await prisma.meeListApplications.findMany({
      where: {
        status: "APPROVED",
        posted: false,
      },
      orderBy: {
        approvedAt: "asc",
      },
    });

    return res.status(200).json({ applications, total });
  } else {
    const application = await prisma.projectApplications.findFirst({
      where: {
        projectId: project.id,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // total
    const total = await prisma.projectApplicationSubmissions.count({
      where: {
        status: "APPROVED",
        posted: false,
        projectApplicationId: application.id,
      },
    });

    const applications = await prisma.projectApplicationSubmissions.findMany({
      where: {
        status: "APPROVED",
        posted: false,
        projectApplicationId: application.id,
      },
      orderBy: {
        approvedAt: "asc",
      },
    });

    return res.status(200).json({ applications, total });
  }
}
