// pages/api/project/[projectSlug]/allowlistTrading.ts

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Project } from "@prisma/client";
import { isUserAdmin } from "@/backend/utils";
import { assignRole } from "@/pages/api/me/marketplace/buy-from-listing";

type ResponseData = {
  project: Project;
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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug } = req.query;
  const { allowlistTradingEnabled } = req.body;

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

  if (!isUserAdmin(project, session.user.id)) {
    return res
      .status(403)
      .json({ message: "Only admins can change this setting." });
  }

  const updatedProject = await prisma.project.update({
    where: {
      slug: projectSlug as string,
    },
    data: {
      allowlistTradingEnabled,
    },
  });

  if (!allowlistTradingEnabled) {
    const listedRecords = await prisma.marketplaceRecord.findMany({
      where: {
        projectId: project.id,
        listed: true,
        processed: false,
      },
    });

    // loop through each one and set the allowlist entry from this record back to the user id of the listed
    for (const record of listedRecords) {
      if (record.allowlistEntryId) {
        await prisma.allowlistEntry.update({
          where: {
            id: record.allowlistEntryId,
          },
          data: {
            userId: record.createdByUserId,
          },
        });

        const allowlistEntry = await prisma.allowlistEntry.findUnique({
          where: {
            id: record.allowlistEntryId,
          },
        });

        if (allowlistEntry && allowlistEntry.role && project.discordGuild) {
          const user = await prisma.account.findFirst({
            where: {
              userId: record.createdByUserId,
              provider: "discord",
            },
          });

          if (user) {
            await assignRole(
              project.discordGuild.id,
              user.providerAccountId,
              allowlistEntry.role.id
            );
          }
        }
      }
    }

    // set all marketplace record listed to false
    await prisma.marketplaceRecord.updateMany({
      where: {
        projectId: project.id,
        listed: true,
      },
      data: {
        listed: false,
        error: "Project disabled allowlist trading.",
      },
    });
  }

  return res.status(200).json({ project: updatedProject });
}
