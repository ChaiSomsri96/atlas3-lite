import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { Presale, PresaleStatus } from "@prisma/client";
import { isUserAdmin, isUserManager } from "@/backend/utils";

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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug, presaleSlug } = req.query;
  const { status } = JSON.parse(req.body);

  if (!status) {
    return res.status(400).json({ message: "Missing status" });
  }

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }
  if (!presaleSlug) {
    return res.status(400).json({ message: "Missing presaleSlug" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      slug: presaleSlug as string,
    },
    include: {
      project: true,
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // if finalizing (ending), set end date to now
  let endsAt = presale.endsAt;

  if (status === PresaleStatus.FINALIZED) {
    endsAt = new Date();
  }

  const updatedPresale = await prisma.presale.update({
    where: {
      slug: presaleSlug as string,
    },
    data: {
      status: status as PresaleStatus,
      endsAt: endsAt,
    },
  });

  return res.status(200).json({ presale: updatedPresale });
}
