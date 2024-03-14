import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { ApplicationStatus, MeeListApplications } from "@prisma/client";

type ResponseData = {
  application: MeeListApplications;
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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, projectSlug } = req.query;
  const { status } = JSON.parse(req.body);

  if (!status) {
    return res.status(400).json({ message: "Missing status" });
  }

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (projectSlug === "meegos") {

    
    const application = await prisma.meeListApplications.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updatedApplication = await prisma.meeListApplications.update({
      where: {
        id: id as string,
      },
      data: {
        status: status as ApplicationStatus,
        approvedAt: status === ApplicationStatus.APPROVED ? new Date() : null,
        submitSaved: false,
      },
    });

    return res.status(200).json({ application: updatedApplication });
  } else {
    const application = await prisma.projectApplicationSubmissions.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updatedApplication =
      await prisma.projectApplicationSubmissions.update({
        where: {
          id: id as string,
        },
        data: {
          status: status as ApplicationStatus,
          approvedAt: status === ApplicationStatus.APPROVED ? new Date() : null,
        },
      });

    return res.status(200).json({ application: updatedApplication });
  }
}
