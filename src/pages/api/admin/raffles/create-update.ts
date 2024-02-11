import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  BlockchainNetwork,
  Giveaway,
  GiveawayStatus,
  UserType,
} from "@prisma/client";
import slugify from "slugify";
import { randomStringForEntropy } from "@stablelib/random";
import { rafflePost } from "@/backend/utils/raffle-post";
import { ExtendedRaffle } from "@/frontend/hooks/useRunningRaffles";

type ResponseData = {
  giveaway: Giveaway;
};

type ErrorData = {
  message: string;
};

const createGiveaway = async (
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
    name,
    description,
    endsAt,
    collabProjectId,
    maxWinners,
    giveawayRoleId,
    network,
    paymentTokenId,
    paymentTokenAmount,
    bannerImageUrl,
    discordInviteUrl,
    discordRoleName,
    twitterUsername,
  } = JSON.parse(req.body);

  if (!name) {
    return res.status(400).json({ message: "Missing name" });
  }

  if (!maxWinners) {
    return res.status(400).json({ message: "Missing maxWinners" });
  }

  if (!collabProjectId && !bannerImageUrl) {
    return res.status(400).json({ message: "Missing banner image" });
  }

  if (!paymentTokenId) {
    return res.status(400).json({ message: "Missing payment token" });
  }

  if (!paymentTokenAmount) {
    return res.status(400).json({ message: "Missing payment token amount" });
  }

  if (!collabProjectId && !description) {
    return res.status(400).json({ message: "Missing description" });
  }

  if (maxWinners < 1)
    return res
      .status(400)
      .json({ message: "Max Winners must be greater than 0" });

  if (
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (name.length > 150) {
    return res
      .status(400)
      .json({ message: "Name must be less than 150 characters long" });
  }

  let collabProject;
  if (collabProjectId) {
    collabProject = await prisma.project.findUnique({
      where: {
        id: collabProjectId as string,
      },
      include: {
        allowlist: true,
      },
    });

    if (!collabProject) {
      return res.status(404).json({ message: "Project not found" });
    }
  }

  let slug = slugify(`${name}`, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  const projectId = process.env.BSL_ID as string;

  const existingGiveaway = await prisma.giveaway.findUnique({
    where: {
      slug,
    },
  });

  if (existingGiveaway) {
    slug = `${slug}-${randomStringForEntropy(32)}`;
  }

  if (new Date(endsAt) < new Date()) {
    return res.status(400).json({ message: "End Date must be in the future" });
  }

  // giveaway can not end longer than 3 days
  if (
    endsAt &&
    new Date(endsAt).getTime() > new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  ) {
    return res
      .status(400)
      .json({ message: "Giveaway can not run for longer than 7 days" });
  }

  let discordServerId = collabProject ? collabProject.discordGuild?.id : "";

  if (discordInviteUrl && !collabProjectId) {
    const code =
      discordInviteUrl.split("/")[discordInviteUrl.split("/").length - 1];

    const result = await fetch(`https://discord.com/api/v10/invites/${code}`, {
      method: "GET",
    });

    const data = await result.json();

    if (data && data.guild && data.guild.id) {
      discordServerId = data.guild.id;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const giveawayData: any = {
    name,
    network: network as BlockchainNetwork,
    endsAt: new Date(endsAt),
    description: description
      ? (description as string)
      : collabProject
      ? collabProject.description
      : "",
    slug: slug,
    status: GiveawayStatus.RUNNING,
    discordRoleId: giveawayRoleId !== "Select One" ? giveawayRoleId : undefined,
    discordRoleName: discordRoleName
      ? discordRoleName
      : collabProject
      ? collabProject.allowlist?.roles?.find((x) => x.id === giveawayRoleId)
          ?.name
      : undefined,
    discordServerId: discordServerId,
    discordInviteUrl: discordInviteUrl
      ? discordInviteUrl
      : collabProject
      ? collabProject.discordInviteUrl
      : undefined,
    twitterUsername: twitterUsername
      ? twitterUsername
      : collabProject
      ? collabProject.twitterUsername
      : undefined,
    type: "RAFFLE",
    collabType: collabProjectId ? "RECEIVE_SPOTS" : undefined,
    adminCreated: true,
    bannerUrl: bannerImageUrl
      ? bannerImageUrl
      : collabProject
      ? collabProject.bannerUrl
      : "",
    maxWinners,
    owner: {
      connect: {
        id: session.user.id,
      },
    },
    project: {
      connect: {
        id: projectId,
      },
    },
    paymentToken: {
      connect: paymentTokenId
        ? {
            id: paymentTokenId,
          }
        : undefined,
    },
    paymentTokenAmount,
    settings: {
      private: false,
    },
  };

  // Conditionally add the collabProject connection if collabProjectId is set
  if (collabProjectId) {
    giveawayData.collabProject = {
      connect: {
        id: collabProjectId as string,
      },
    };
  }

  const giveaway = await prisma.giveaway.create({
    data: giveawayData,
    include: {
      paymentToken: true,
      collabProject: true,
    },
  });

  if (!giveaway) {
    return res.status(500).json({ message: "Internal server error" });
  }

  // call API to post to discord
  try {
    await rafflePost(
      giveaway as ExtendedRaffle,
      "https://discord.com/api/webhooks/1130832021845983302/CS_eJ4senHQR1SD681mUQREwOuu6JRFDIqHVs4Mqf-nrzjAOeVgk0im8XEJdRYqJhqJY",
      "969590096221331568"
    );
    await rafflePost(
      giveaway as ExtendedRaffle,
      "https://discord.com/api/webhooks/1130832167010848778/MxAF37XawXatA3zs6OgiiImdkOED0SXm9My-Fq4QaUhZkn-ogqqpf9AaWapehPyQH9B2",
      "1130832933159194644"
    );
  } catch (e) {
    console.log("Error posting giveaway to discord", e);
  }

  res.status(200).json({ giveaway });
};

const editGiveaway = async (
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
    id,
    name,
    endsAt,
    maxWinners,
    giveawayRoleId,
    network,
    description,
    bannerImageUrl,
    discordInviteUrl,
    discordRoleName,
    twitterUsername,
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

  if (!maxWinners) {
    return res.status(400).json({ message: "Missing maxWinners" });
  }

  if (
    session.user.type !== UserType.ADMIN &&
    session.user.type !== UserType.MASTER
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      id,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  const updatedGiveaway = await prisma.giveaway.update({
    where: {
      id,
    },
    data: {
      name,
      endsAt: new Date(endsAt),
      network: network as BlockchainNetwork,
      maxWinners,
      discordRoleId:
        giveawayRoleId !== "Select One" ? giveawayRoleId : undefined,
      description,
      bannerUrl: bannerImageUrl ? bannerImageUrl : giveaway.bannerUrl,
      discordInviteUrl: discordInviteUrl
        ? discordInviteUrl
        : giveaway.discordInviteUrl,
      discordRoleName: discordRoleName
        ? discordRoleName
        : giveaway.discordRoleName,
      twitterUsername: twitterUsername
        ? twitterUsername
        : giveaway.twitterUsername,
    },
  });

  res.status(200).json({ giveaway: updatedGiveaway });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "POST":
      return createGiveaway(req, res);
    case "PUT":
      return editGiveaway(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
