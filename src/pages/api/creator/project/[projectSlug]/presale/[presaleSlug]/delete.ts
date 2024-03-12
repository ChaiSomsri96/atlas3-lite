import { isUserAdmin, isUserManager } from "@/backend/utils";
import { Presale, PresaleStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import prisma from "@/backend/lib/prisma";

type ResponseData = {
  presale: Presale;
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

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug, presaleSlug } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }

  if (!presaleSlug) {
    return res.status(400).json({ message: "Missing presaleSlug" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
    include: {
      project: true,
      entries: true,
    },
  });

  if (presale?.status === PresaleStatus.FINALIZED) {
    return res
      .status(400)
      .json({ message: "Can't delete a giveaway which is finished." });
  }

  if (!presale) {
    return res.status(404).json({ message: "presale not found" });
  }
  if (
    !isUserAdmin(presale.project, session.user.id) &&
    !isUserManager(presale.project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (presale.entries?.length > 0) {
    return res
      .status(400)
      .json({ message: "Can't delete a presale which has entries." });
  }

  // delete presale entries
  await prisma.presaleEntry.deleteMany({
    where: {
      presaleId: presale.id,
    },
  });

  // create activity log record
  await prisma.activityLog.create({
    data: {
      type: "PRESALE_DELETED",
      relatedId: presale.id,
      userId: session.user.id,
      relatedDescription: presale.name,
    },
  });

  const deletedPresale = await prisma.presale.delete({
    where: {
      slug: presaleSlug as string,
    },
  });

  return res.status(200).json({ presale: deletedPresale });
}
