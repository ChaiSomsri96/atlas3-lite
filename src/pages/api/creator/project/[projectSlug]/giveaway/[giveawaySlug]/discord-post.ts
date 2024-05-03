import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { BlockchainNetwork, CollabType, GiveawayStatus } from "@prisma/client";

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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { projectSlug, giveawaySlug } = req.query;

  if (!projectSlug) {
    return res.status(400).json({ message: "Missing projectSlug" });
  }
  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      slug: giveawaySlug as string,
    },
    include: {
      collabProject: true,
      project: true,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  // if receiving spots
  if (
    giveaway.collabType === CollabType.RECEIVE_SPOTS &&
    giveaway.project?.channelPostSettings &&
    giveaway.project?.channelPostSettings.length > 0 &&
    giveaway.status === GiveawayStatus.RUNNING
  ) {
    const channel = giveaway.project.channelPostSettings.find(
      (x) =>
        x.network ===
        (giveaway.network === "TBD"
          ? BlockchainNetwork.Solana
          : giveaway.network)
    );

    if (!channel) {
      return res.status(404).json({
        message: `There is no giveaway notification channel configured for ${giveaway.network}. Please set this up in your settings.`,
      });
    }

    if (channel) {
      const roleId = channel.roleId ? `&roleId=${channel.roleId}` : "";
      const roleName = channel.roleName ? `&roleName=${channel.roleName}` : "";
      try {
        fetch(
          `${process.env.GIVEAWAYBOT_API}/?giveawaySlug=${giveaway.slug}&channelId=${channel.channelId}${roleId}${roleName}`,
          {
            method: "GET",
          }
        );
      } catch (e) {
        console.log("Error posting giveaway to discord", e);
      }
    }
  }

  // if giving spots, then post to the collab projects server
  if (
    giveaway.collabProject &&
    giveaway.collabType === CollabType.GIVE_SPOTS &&
    giveaway.collabProject.channelPostSettings &&
    giveaway.collabProject.channelPostSettings.length > 0 &&
    giveaway.status === GiveawayStatus.RUNNING
  ) {
    const channel = giveaway.collabProject.channelPostSettings.find(
      (x) =>
        x.network ===
        (giveaway.network === "TBD"
          ? BlockchainNetwork.Solana
          : giveaway.network)
    );

    if (!channel) {
      return res.status(404).json({
        message: `There is no giveaway notification channel configured for ${giveaway.network}. Please set this up in your settings.`,
      });
    }

    if (channel) {
      const roleId = channel.roleId ? `&roleId=${channel.roleId}` : "";
      const roleName = channel.roleName ? `&roleName=${channel.roleName}` : "";
      try {
        fetch(
          `${process.env.GIVEAWAYBOT_API}/?giveawaySlug=${giveaway.slug}&channelId=${channel.channelId}${roleId}${roleName}`,
          {
            method: "GET",
          }
        );
      } catch (e) {
        console.log("Error posting giveaway to discord", e);
      }
    }
  }

  // no collab project, just post to projects discord
  if (!giveaway.collabProjectId) {
    try {
      console.log("posting giveaway to discord");

      // get the relevant channel
      if (project.network) {
        const channel = project.channelPostSettings.find(
          (x) =>
            x.network ===
            (giveaway.network === "TBD"
              ? BlockchainNetwork.Solana
              : giveaway.network)
        );

        if (channel) {
          const roleId = channel.roleId ? `&roleId=${channel.roleId}` : "";
          const roleName = channel.roleName
            ? `&roleName=${channel.roleName}`
            : "";
          fetch(
            `${process.env.GIVEAWAYBOT_API}/?giveawaySlug=${giveaway.slug}&channelId=${channel.channelId}${roleId}${roleName}`,
            {
              method: "GET",
            }
          );
        }
      }
    } catch (e) {
      console.log("Error posting giveaway to discord", e);
    }
  }

  return res.status(200).json({ success: true });
}
