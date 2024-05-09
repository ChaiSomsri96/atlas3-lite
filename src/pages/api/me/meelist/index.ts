import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { MeeListApplications } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export type MeeListResponseData = {
  application: MeeListApplications | null;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeeListResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const application = await prisma.meeListApplications.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  res.status(200).json({ application });
}
