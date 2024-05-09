import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { GiveawayRule, Presale, PresaleStatus, UserType } from "@prisma/client";
import { randomStringForEntropy } from "@stablelib/random";

type ResponseData = {
  presale: Presale;
};

type ErrorData = {
  message: string;
};

const createPresale = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, rules, endsAt, supply, maxSupplyPerUser, pointsCost } =
    JSON.parse(req.body);

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!supply) {
    return res.status(400).json({ message: "Missing supply" });
  }

  if (maxSupplyPerUser < 1) {
    return res
      .status(400)
      .json({ message: "Max Supply Per User must be greater than 0" });
  }

  if (pointsCost < 1) {
    return res
      .status(400)
      .json({ message: "Points Cost must be greater than 0" });
  }

  if (
    session.user.type !== UserType.CREATOR &&
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: req.query.projectSlug as string,
    },
    include: {
      allowlist: true,
    },
  });
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.status !== "PUBLISHED") {
    return res.status(403).json({
      message: "You can only create presales for published projects",
    });
  }

  const slug = randomStringForEntropy(32);

  if (!endsAt) {
    return res.status(400).json({ message: "Missing End Date" });
  }

  if (new Date(endsAt) < new Date()) {
    return res.status(400).json({ message: "End Date must be in the future" });
  }

  const presale = await prisma.presale.create({
    data: {
      name,
      description: project.description,
      slug,
      rules: rules as GiveawayRule[],
      endsAt: new Date(endsAt),
      supply,
      maxSupplyPerUser,
      network: project.network,
      status: PresaleStatus.RUNNING,
      pointsCost: pointsCost * 1000,
      owner: {
        connect: {
          id: session.user.id,
        },
      },
      project: {
        connect: {
          id: project.id,
        },
      },
    },
  });

  if (!presale) {
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(200).json({ presale });
};

const editPresale = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id, name, rules, endsAt, supply, maxSupplyPerUser, pointsCost } =
    JSON.parse(req.body);

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!endsAt) {
    return res.status(400).json({ message: "Missing endsAt" });
  }

  if (new Date(endsAt) < new Date()) {
    return res.status(400).json({ message: "endsAt must be in the future" });
  }

  if (!supply) {
    return res.status(400).json({ message: "Missing supply" });
  }

  if (maxSupplyPerUser < 1) {
    return res
      .status(400)
      .json({ message: "Max Supply Per User must be greater than 0" });
  }

  if (pointsCost < 1) {
    return res
      .status(400)
      .json({ message: "Points Cost must be greater than 0" });
  }

  if (
    session.user.type !== UserType.CREATOR &&
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: req.query.projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const presale = await prisma.presale.findUnique({
    where: {
      id,
    },
    include: {
      project: true,
    },
  });

  if (!presale) {
    return res.status(404).json({ message: "presale not found" });
  }

  const updatedPresale = await prisma.presale.update({
    where: {
      id,
    },
    data: {
      name,
      endsAt: new Date(endsAt),
      rules: rules as GiveawayRule[],
      supply,
      maxSupplyPerUser,
    },
  });

  res.status(200).json({ presale: updatedPresale });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "PUT":
      return createPresale(req, res);
    case "POST":
      return editPresale(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
