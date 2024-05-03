import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  BlockchainNetwork,
  CollabType,
  Giveaway,
  GiveawayStatus,
  ProjectPhase,
} from "@prisma/client";
import { isUserAdmin, isUserManager } from "@/backend/utils";

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

  const { projectSlug, giveawaySlug } = req.query;
  const { status, spots, preventDuplicateIps } = JSON.parse(req.body);

  if (!status) {
    return res.status(400).json({ message: "Missing status" });
  }

  // if (
  //   ![
  //     GiveawayStatus.COLLAB_READY,
  //     GiveawayStatus.COLLAB_REJECTED,
  //     GiveawayStatus.RUNNING,
  //     GiveawayStatus.DRAFT,
  //   ].includes(status)
  // ) {
  //   return res.status(400).json({ message: "Invalid status" });
  // }

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
    include: {
      allowlist: true,
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

  let rulesToUse = giveaway.rules;

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (giveaway.collabProjectId) {
    // return res.status(400).json({ message: "Giveaway is not a collab" });

    const collabProject = await prisma.project.findUnique({
      where: {
        id: giveaway.collabProjectId,
      },
    });

    if (!collabProject) {
      return res.status(404).json({ message: "Collab project not found" });
    }

    if (
      giveaway.collabType === CollabType.RECEIVE_SPOTS &&
      !project.allowlist &&
      status === GiveawayStatus.RUNNING
    ) {
      return res.status(400).json({
        message:
          "You must have an allowlist configured to be able to giveaway spots.",
      });
    }

    if (
      [GiveawayStatus.COLLAB_READY, GiveawayStatus.COLLAB_REJECTED].includes(
        status
      )
    ) {
      if (giveaway.status !== GiveawayStatus.COLLAB_PENDING) {
        return res.status(400).json({
          message: "Giveaway status must be COLLAB_PENDING to update status",
        });
      }

      if (
        (giveaway.collabType &&
          giveaway.collabType === CollabType.GIVE_SPOTS &&
          !project.roles.some((role) => role.userId === session.user.id)) ||
        (giveaway.collabType &&
          giveaway.collabType === CollabType.RECEIVE_SPOTS &&
          !collabProject.roles.some((role) => role.userId === session.user.id))
      ) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    if (
      giveaway.collabType &&
      (giveaway.collabType === CollabType.RECEIVE_SPOTS ||
        giveaway.collabType === CollabType.GIVE_SPOTS) &&
      project.phase === ProjectPhase.POSTMINT &&
      !project.holderRules.length
    ) {
      return res.status(400).json({
        message:
          "You must have holder rules configured to be able to receive spots.",
      });
    }

    // if we are receiving spots, and the holder rules do not already exist on the giveaway, then set them
    if (
      giveaway.collabType &&
      (giveaway.collabType === CollabType.RECEIVE_SPOTS ||
        giveaway.collabType === CollabType.GIVE_SPOTS) &&
      project.phase === ProjectPhase.POSTMINT
    ) {
      rulesToUse = giveaway.rules;

      const existingRuleIds = rulesToUse.map((rule) => rule.id);

      for (const rule of project.holderRules) {
        if (!existingRuleIds.includes(rule.id)) {
          rulesToUse.push(rule);
        }
      }
    }

    if (status === GiveawayStatus.RUNNING) {
      if (!project.roles.some((role) => role.userId === session.user.id)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    if (status === GiveawayStatus.COLLAB_PENDING) {
      if (
        giveaway.collabRequestDeadline &&
        giveaway.collabRequestDeadline < new Date()
      ) {
        return res.status(400).json({
          message: "Collab request deadline has passed",
        });
      }
    }
  }

  // if finalizing (ending), set end date to now
  let endsAt = giveaway.endsAt;

  if (status === GiveawayStatus.FINALIZED) {
    endsAt = new Date();
  }

  if (giveaway.collabDuration && status !== GiveawayStatus.FINALIZED) {
    endsAt = new Date(Date.now() + giveaway.collabDuration * (60 * 60 * 1000));
  }

  const updatedGiveaway = await prisma.giveaway.update({
    where: {
      slug: giveawaySlug as string,
    },
    data: {
      status: status as GiveawayStatus,
      endsAt: endsAt,
      maxWinners: spots > 0 ? spots : giveaway.maxWinners,
      countered: spots > 0 ? true : false,
      rules: rulesToUse,
      settings: {
        set: {
          preventDuplicateIps:
            preventDuplicateIps ?? giveaway.settings?.preventDuplicateIps,
          private: giveaway.settings?.private,
          overrideRoleId: giveaway.settings?.overrideRoleId,
          multipleCollabProjects: giveaway.settings?.multipleCollabProjects,
        },
      },
    },
  });

  // if receiving spots
  if (
    giveaway.collabType === CollabType.RECEIVE_SPOTS &&
    giveaway.project?.channelPostSettings &&
    giveaway.project?.channelPostSettings.length > 0 &&
    updatedGiveaway.status === GiveawayStatus.RUNNING &&
    !giveaway.settings?.private &&
    !giveaway.teamSpots
  ) {
    const channel = giveaway.project.channelPostSettings.find(
      (x) =>
        x.network ===
        (giveaway.network === "TBD"
          ? BlockchainNetwork.Solana
          : giveaway.network)
    );

    if (channel) {
      const roleId = channel.roleId ? `&roleId=${channel.roleId}` : "";
      const roleName = (channel.roleName = channel.roleName
        ? `&roleName=${channel.roleName}`
        : "");
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
    updatedGiveaway.status === GiveawayStatus.RUNNING &&
    !giveaway.settings?.private &&
    !giveaway.teamSpots
  ) {
    const channel = giveaway.collabProject.channelPostSettings.find(
      (x) =>
        x.network ===
        (giveaway.network === "TBD"
          ? BlockchainNetwork.Solana
          : giveaway.network)
    );

    if (channel) {
      const roleId = channel.roleId ? `&roleId=${channel.roleId}` : "";
      const roleName = (channel.roleName = channel.roleName
        ? `&roleName=${channel.roleName}`
        : "");
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

  return res.status(200).json({ giveaway: updatedGiveaway });
}
