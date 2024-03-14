import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  Giveaway,
  GiveawayRule,
  GiveawayStatus,
  GiveawayType,
  UserType,
} from "@prisma/client";
import slugify from "slugify";

type ResponseData = {
  giveaway: Giveaway;
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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    name,
    description,
    rules,
    type,
    endsAt,
    maxWinners,
    collabProjectId,
  } = JSON.parse(req.body);

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!endsAt) {
    return res.status(400).json({ message: "Missing endsAt" });
  }

  if (new Date(endsAt) < new Date()) {
    return res.status(400).json({ message: "endsAt must be in the future" });
  }

  if (!description) {
    return res.status(400).json({ message: "Missing description" });
  }

  if (!maxWinners) {
    return res.status(400).json({ message: "Missing maxWinners" });
  }

  if (!collabProjectId) {
    return res.status(400).json({ message: "Missing collabProjectId" });
  }

  if (!type || !Object.values(GiveawayType).includes(type)) {
    return res.status(400).json({ message: "Missing type" });
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

  const giveaway = await prisma.giveaway.create({
    data: {
      name,
      description,
      endsAt: new Date(endsAt),
      slug: slugify(`${name}`, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      }),
      status: GiveawayStatus.DRAFT,
      type: type as GiveawayType,
      rules: rules as GiveawayRule[],
      maxWinners,
      project: {
        connect: {
          id: project.id,
        },
      },
      owner: {
        connect: {
          id: session.user.id,
        },
      },
      // Collab

      collabProject: {
        connect: {
          id: collabProjectId,
        },
      },
      // collabType: GiveawayCollabType.PROJECT,
    },
  });

  res.status(200).json({ giveaway });
}
