import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { PresaleEntry, Prisma } from "@prisma/client";

type ResponseData = {
  entries: PresaleEntry[];
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

  const { projectSlug, presaleSlug, page, pageLength, search } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }
  if (!presaleSlug) {
    return res.status(400).json({ message: "Missing presaleSlug" });
  }

  // get giveaway id from giveaway slug
  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
    select: {
      id: true,
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  const _page = Math.max(parseInt(page as string), 1) - 1;
  const _pageLength = parseInt(pageLength as string);

  const where: {
    presaleId: string;
    user?: {
      name: {
        contains: string;
        mode: Prisma.QueryMode;
      };
    };
  } = {
    presaleId: presale.id,
  };

  if (search) {
    where.user = {
      name: {
        contains: search as string,
        mode: "insensitive",
      },
    };
  }

  // get entries
  const total = await prisma.presaleEntry.count({
    where,
  });
  const entries = await prisma.presaleEntry.findMany({
    where,

    include: {
      user: {
        include: {
          accounts: true,
        },
      },
    },
    skip: _pageLength * _page,
    take: _pageLength,
  });

  return res.status(200).json({ entries, total });
}
