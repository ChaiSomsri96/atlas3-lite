import type { NextApiRequest, NextApiResponse } from "next";
import { Giveaway } from "@prisma/client";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  raffles: Giveaway[];
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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const total = await prisma.giveaway.count({
    where: {
      status: "RUNNING",
      adminCreated: true,
    },
  });

  let raffles;
  if (session) {
    raffles = await prisma.giveaway.findMany({
      where: {
        status: "RUNNING",
        adminCreated: true,
      },
      include: {
        entries: {
          where: {
            userId: session.user.id,
          },
        },
        collabProject: {
          include: {
            allowlist: true,
          },
        },
        paymentToken: true,
      },
      orderBy: {
        endsAt: "asc",
      },
    });
  } else {
    raffles = await prisma.giveaway.findMany({
      where: {
        status: "RUNNING",
        adminCreated: true,
      },
    });
  }

  res.status(200).json({ raffles, total });
}
