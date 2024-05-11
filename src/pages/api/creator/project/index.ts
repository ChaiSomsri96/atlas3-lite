import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  BlockchainNetwork,
  Prisma,
  Project,
  ProjectRoleType,
  ProjectStatus,
  UserType,
} from "@prisma/client";
import slugify from "slugify";
import { isUserAdmin } from "@/backend/utils";
import { randomStringForEntropy } from "@stablelib/random";

type ResponseData = {
  project: Project;
};

type ErrorData = {
  message: string;
};

const createProject = async (
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

  const {
    name,
    description,
    phase,
    supply,
    mintPrice,
    mintDate,
    mintTime,
    websiteUrl,
    network,
    imageUrl,
    bannerUrl,
    discordInviteUrl,
    referrer,
  } = JSON.parse(req.body);

  if (!network) {
    return res.status(400).json({ message: "Missing network" });
  }

  if (!Object.values(BlockchainNetwork).includes(network)) {
    return res.status(400).json({ message: "Invalid network" });
  }

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!description) {
    return res.status(400).json({ message: "Missing description" });
  }

  if (discordInviteUrl && !discordInviteUrl.startsWith("https://discord")) {
    return res.status(400).json({ message: "Invalid Discord Invite URL" });
  }

  if (websiteUrl && !websiteUrl.startsWith("https://")) {
    return res
      .status(400)
      .json({ message: "Invalid Website URL. Must begin with https://" });
  }

  if (phase === "Select one") {
    return res.status(400).json({ message: "Missing phase" });
  }

  if (
    session.user.type !== UserType.CREATOR &&
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let project;
  try {
    project = await prisma.project.create({
      data: {
        name,
        description,
        slug: slugify(`${name}`, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        status: ProjectStatus.PUBLISHED,
        roles: [
          {
            type: ProjectRoleType.ADMIN,
            userId: session.user.id,
          },
        ],
        phase,
        supply,
        mintPrice,
        mintDate,
        mintTime,
        websiteUrl,
        network,
        imageUrl,
        bannerUrl,
        discordInviteUrl,
        referrer,
        rank: 10,
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        project = await prisma.project.create({
          data: {
            name,
            description,
            slug: slugify(`${name}-${randomStringForEntropy(32)}`, {
              lower: true,
              strict: true,
              remove: /[*+~.()'"!:@]/g,
            }),
            status: ProjectStatus.PUBLISHED,
            roles: [
              {
                type: ProjectRoleType.ADMIN,
                userId: session.user.id,
              },
            ],
            phase,
            supply,
            mintPrice,
            mintDate,
            mintTime,
            websiteUrl,
            network,
            imageUrl,
            bannerUrl,
            discordInviteUrl,
            rank: 10,
          },
        });
      }
    }
  }

  if (!project) {
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(200).json({ project });
};

const updateProject = async (
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

  const {
    id,
    name,
    description,
    network,
    phase,
    supply,
    mintPrice,
    mintDate,
    mintTime,
    imageUrl,
    bannerUrl,
    websiteUrl,
    discordInviteUrl,
  } = JSON.parse(req.body);

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!description) {
    return res.status(400).json({ message: "Missing description" });
  }

  if (!network) {
    return res.status(400).json({ message: "Missing network" });
  }

  if (!phase) {
    return res.status(400).json({ message: "Missing phase" });
  }

  if (discordInviteUrl && !discordInviteUrl.startsWith("https://discord")) {
    return res.status(400).json({ message: "Invalid Discord Invite URL" });
  }

  if (websiteUrl && !websiteUrl.startsWith("https://")) {
    return res
      .status(400)
      .json({ message: "Invalid Website URL. Must begin with https://" });
  }

  if (
    session.user.type !== UserType.CREATOR &&
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!imageUrl || imageUrl === "") {
    return res.status(400).json({ message: "Missing image" });
  }

  if (!bannerUrl || bannerUrl === "") {
    return res.status(400).json({ message: "Missing banner" });
  }

  const existingProject = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!existingProject) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!isUserAdmin(existingProject, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const project = await prisma.project.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      network,
      phase,
      supply,
      mintPrice,
      mintDate,
      mintTime,
      imageUrl,
      bannerUrl,
      websiteUrl,
      discordInviteUrl,
    },
  });

  res.status(200).json({ project });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "PUT":
      return createProject(req, res);
    case "POST":
      return updateProject(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
