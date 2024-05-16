import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

export type UserPoints = {
  points: number;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserPoints | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      points: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ points: user.points });
}
