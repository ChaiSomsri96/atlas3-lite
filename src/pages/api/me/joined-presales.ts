import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Presale, Project, PresaleEntry } from "@prisma/client";

type PresaleWithProject = Omit<Presale, "projectId"> & {
  project: Project;
};

export type UserPresaleEntry = Omit<PresaleEntry, "presale"> & {
  presale: PresaleWithProject;
};

export type PresaleEntriesResponseData = {
  entries: UserPresaleEntry[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PresaleEntriesResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const presaleEntries = await prisma.presaleEntry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      presale: {
        include: {
          project: true,
        },
      },
    },
  });

  const userPresaleEntries: UserPresaleEntry[] = presaleEntries.map((entry) => ({
    ...entry,
    presale: {
      ...entry.presale,
      project: entry.presale.project,
    },
  }));

  return res.status(200).json({ entries: userPresaleEntries });
}
