import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { Presale, PresaleEntry, Project } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  presale: {
    project: Project;
    entries?: PresaleEntry[];
  } & Presale;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  const { presaleSlug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
    include: {
      project: true,
      entries: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "Presale not found" });
  }

  res.status(200).json({ presale });
}
