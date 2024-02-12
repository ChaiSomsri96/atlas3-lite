import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { UserType } from "@prisma/client";

type ResponseData = {
  success: boolean;
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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.query;

  if (
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: slug as string,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  if (!giveaway.adminCreated) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  await prisma.giveaway.delete({
    where: {
      id: giveaway.id,
    },
  });

  res.status(200).json({ success: true });
}
