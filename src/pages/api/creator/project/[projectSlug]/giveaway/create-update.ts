import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  BlockchainNetwork,
  CollabType,
  Giveaway,
  GiveawayRule,
  GiveawaySettings,
  GiveawayStatus,
  GiveawayType,
  Project,
  UserType,
} from "@prisma/client";
import slugify from "slugify";
import { randomStringForEntropy } from "@stablelib/random";
import { randomBytes } from "crypto";

type ResponseData = {
  giveaway: Giveaway;
};

type ErrorData = {
  message: string;
};

async function createGiveawayForProject(
  nameToUse: string,
  description: string,
  slugToUse: string,
  type: GiveawayType,
  rulesToUse: GiveawayRule[],
  settings: GiveawaySettings | null,
  collabType: CollabType,
  maxWinners: number,
  collabDuration: number,
  collabRequestDeadline: Date,
  discordRoleId: string,
  network: BlockchainNetwork | undefined,
  collabProject: Project,
  project: Project,
  userId: string,
  paymentTokenId: string | undefined,
  paymentTokenAmount: number | undefined,
  teamSpots: boolean
) {
  const createdGiveaway = await prisma.giveaway.create({
    data: {
      name: nameToUse,
      description,
      slug: slugToUse,
      status: GiveawayStatus.COLLAB_PENDING,
      type: type as GiveawayType,
      rules: rulesToUse as GiveawayRule[],
      settings: settings as GiveawaySettings | null,
      collabType,
      maxWinners,
      collabDuration,
      collabRequestDeadline,
      discordRoleId,
      teamSpots,
      network: network
        ? (network as BlockchainNetwork)
        : collabType === CollabType.RECEIVE_SPOTS
        ? project.network
        : collabProject.network,
      bannerUrl:
        collabType === CollabType.RECEIVE_SPOTS
          ? collabProject.bannerUrl
          : project.bannerUrl,
      owner: {
        connect: {
          id: userId,
        },
      },
      project: {
        connect: {
          id: project.id,
        },
      },
      collabProject: {
        connect: {
          id: collabProject.id,
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
    },
  });
  return createdGiveaway;
}

const createGiveawayForCollabProject = async (
  collabProjectId: string,
  collabType: CollabType,
  project: Project,
  type: GiveawayType,
  settings: GiveawaySettings,
  maxWinners: number,
  collabDuration: number,
  collabRequestDeadline: Date,
  userId: string,
  paymentTokenId: string | undefined,
  paymentTokenAmount: number | undefined,
  teamSpots: number | undefined,
  rules: GiveawayRule[] | undefined
) => {
  const collabProject = await prisma.project.findUnique({
    where: {
      id: collabProjectId,
    },
  });

  if (!collabProject) {
    return null;
  }

  let rulesToUse = [] as GiveawayRule[];
  let discordRoleId = "";
  let description = "";
  let network;
  let nameToUse = `${project.name} X ${collabProject.name}`;

  if (nameToUse === "") nameToUse = `${project.name} X ${collabProject.name}`;
  let slugToUse = slugify(`${project.name} X ${collabProject.name}`, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  const existingGiveaway = await prisma.giveaway.findFirst({
    where: {
      slug: slugToUse,
    },
  });

  if (existingGiveaway) {
    slugToUse = `${slugToUse}-${randomStringForEntropy(4)}`;
  }

  if (collabType === CollabType.GIVE_SPOTS) {
    // if we are giving spots, then the role ID needs to be our projects default role ID
    if (project.defaultRoleId) {
      discordRoleId = project.defaultRoleId;
    }

    description = project.description;
    network = project.network;

    if (
      settings &&
      settings.overrideRoleId &&
      settings.overrideRoleId !== "Select One"
    )
      discordRoleId = settings.overrideRoleId;

    // if we are giving spots, default rules to ours, for e.g. make other project users follow our twitter
    if (project.defaultRules && project.defaultRules.length > 0) {
      //  console.log('setting default rules')
      rulesToUse = [...project.defaultRules];
    }

    // if we are giving spots, apply the other projects default holder requirements because its only their holders that should be able to join
    if (collabProject.holderRules?.length > 0) {
      for (const rule of collabProject.holderRules) {
        rulesToUse.push(rule);
      }
    }
  }

  // if we are receiving spots, then the role ID needs to be the collab projects default role ID
  if (collabType === CollabType.RECEIVE_SPOTS) {
    if (collabProject.defaultRoleId) {
      discordRoleId = collabProject.defaultRoleId;
    }

    description = collabProject.description;
    network = collabProject.network;

    // if this collab is to receive spots, then we need to use the collab projects default rules (follow twitter etc)
    if (collabProject.defaultRules && collabProject.defaultRules.length > 0) {
      rulesToUse = [...collabProject.defaultRules];
    }

    // if this collab is to receive spots, then we need to use our default holder rules
    if (project.holderRules && project.holderRules.length > 0) {
      for (const rule of project.holderRules) {
        rulesToUse.push(rule);
      }
    }

    // if asking to receive spots spots, then make sure collab project is post mint
    if (collabProject.phase !== "PREMINT") {
      return null;
    }
  }

  if (collabType === CollabType.GIVE_SPOTS) {
    description = project.description;
  }

  // loop through rules and add any to rulesToUse that don't already exist based on the id
  if (rules && rules.length > 0) {
    for (const rule of rules) {
      if (!rule.id) {
        rulesToUse.push(rule);
      }
    }
  }

  const createdGiveaway = await createGiveawayForProject(
    nameToUse,
    description,
    slugToUse,
    type,
    rulesToUse,
    settings,
    collabType,
    maxWinners,
    collabDuration,
    collabRequestDeadline,
    discordRoleId,
    network,
    collabProject,
    project,
    userId,
    paymentTokenId,
    paymentTokenAmount,
    false
  );

  if (teamSpots && teamSpots > 0) {
    let settingsToUse = settings ? { ...settings } : undefined;
    const teamRules = [] as GiveawayRule[];

    for (const rule of rulesToUse) {
      if (rule.discordGuildRule && rule.discordGuildRule.guildId) {
        teamRules.push(rule);
      }
    }

    if (settingsToUse) {
      settingsToUse.private = true;
    } else {
      settingsToUse = {
        private: true,
        preventDuplicateIps: false,
        overrideRoleId: "",
        multipleCollabProjects: [],
      };
    }

    await createGiveawayForProject(
      nameToUse,
      description,
      randomBytes(10).toString("hex"),
      GiveawayType.RAFFLE,
      teamRules,
      settingsToUse,
      collabType,
      teamSpots,
      collabDuration,
      collabRequestDeadline,
      discordRoleId,
      network,
      collabProject,
      project,
      userId,
      paymentTokenId,
      paymentTokenAmount,
      true
    );
  }

  if (
    collabProject.discordGuild &&
    collabProject.discordGuild.incomingCollabsChannelId
  )
    // post request to collab projects discord
    try {
      console.log("posting collab to discord");
      const roleId = collabProject.discordGuild.incomingCollabsTagId
        ? `&roleId=${collabProject.discordGuild.incomingCollabsTagId}`
        : "";
      fetch(
        `${process.env.GIVEAWAYBOT_API}/collabs?giveawaySlug=${createdGiveaway.slug}&channelId=${collabProject.discordGuild.incomingCollabsChannelId}${roleId}`,
        {
          method: "GET",
        }
      );
    } catch (e) {
      console.log("Error posting giveaway to discord", e);
    }

  return createdGiveaway;
};

const createGiveaway = async (
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
    rules,
    type,
    endsAt,
    maxWinners,
    collabProjectId,
    collabProjectIds,
    collabRequestDeadline,
    collabDuration,
    collabType,
    discordPost,
    giveawayRoleId,
    privateGiveaway,
    settings,
    network,
    bannerUrl,
    paymentTokenId,
    paymentTokenAmount,
    teamSpots,
  } = JSON.parse(req.body);

  let collabProjectIdsToUse: string[] = [];

  if (collabProjectIds && collabProjectIds.length > 0) {
    collabProjectIdsToUse = collabProjectIds;
  } else {
    if (collabProjectId) {
      collabProjectIdsToUse = [collabProjectId];
    }
  }

  if (!maxWinners) {
    return res.status(400).json({ message: "Missing maxWinners" });
  }

  if (maxWinners < 1)
    return res
      .status(400)
      .json({ message: "Max Winners must be greater than 0" });

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

  if (name && name.length > 150) {
    return res
      .status(400)
      .json({ message: "Name must be less than 150 characters long" });
  }

  if (description && description.length > 5000) {
    return res
      .status(400)
      .json({ message: "Description must be less than 5000 characters long" });
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
      message: "You can only create giveaways for published projects",
    });
  }

  let slug = "";
  if (name && name !== "") {
    slug = slugify(`${name}`, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const existingGiveaway = await prisma.giveaway.findUnique({
      where: {
        slug,
      },
    });

    if (existingGiveaway) {
      slug = `${slug}-${randomStringForEntropy(32)}`;
    }
  }

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  let giveaway;
  if (collabProjectIdsToUse && collabProjectIdsToUse.length > 0) {
    console.log("[createGiveaway] Checking collab info");

    if (!collabType || !Object.values(CollabType).includes(collabType)) {
      return res.status(400).json({ message: "Missing collabType" });
    }

    // if we are requesting to receive spots and we are post mint then need holder rules
    if (
      collabType === CollabType.RECEIVE_SPOTS &&
      project.phase === "POSTMINT"
    ) {
      if (!project.holderRules || project.holderRules.length === 0) {
        return res.status(400).json({
          message:
            "Your project must have holder rules configured before receiving spots. You can set this up on the Settings page under giveaway. This ensures only your holders can join this giveaway.",
        });
      }
    }

    // if giving spots, then deadlines necessary
    if (collabType === CollabType.GIVE_SPOTS) {
      if (!collabRequestDeadline) {
        return res
          .status(400)
          .json({ message: "Missing collabRequestDeadline" });
      }

      if (new Date(collabRequestDeadline) < new Date()) {
        return res
          .status(400)
          .json({ message: "collabRequestDeadline must be in the future" });
      }

      if (!project.allowlist && project.network !== "TBD") {
        return res.status(400).json({
          message:
            "Your project must have an allowlist configured before giving spots. You can set this up on the Wallet Collection page.",
        });
      }

      const discordGuildRule = project.defaultRules.find(
        (x) => x.type === "DISCORD_GUILD"
      );

      if (!discordGuildRule) {
        return res.status(400).json({
          message:
            "Your project must have a 'Discord Server Rule' configured in your 'Default Giveaway Requirements' within the settings page. This will ensure that the users who are joining your giveaway HAVE to be in your server.",
        });
      }
    }

    if (!collabDuration || collabDuration < 1) {
      return res.status(400).json({ message: "Missing collabDuration" });
    }

    if (collabDuration > 168) {
      return res
        .status(400)
        .json({ message: "Giveaway Duration must be less than 168 hours" });
    }

    if (collabDuration < 1) {
      return res
        .status(400)
        .json({ message: "collabDuration must be greater than 1" });
    }

    for (const collabProjectId of collabProjectIdsToUse) {
      try {
        // create for the main collab project
        giveaway = await createGiveawayForCollabProject(
          collabProjectId,
          collabType,
          project,
          type,
          settings,
          maxWinners,
          collabDuration,
          collabRequestDeadline,
          session.user.id,
          paymentTokenId,
          paymentTokenAmount,
          teamSpots,
          rules
        );
      } catch (e) {
        console.log(e);
        return res.status(400).json({ message: (e as Error).message });
      }
    }
  } else {
    console.log("[createGiveaway] No collab info");

    if (!endsAt) {
      return res.status(400).json({ message: "Missing End Date" });
    }

    if (new Date(endsAt) < new Date()) {
      return res
        .status(400)
        .json({ message: "End Date must be in the future" });
    }

    // giveaway can not end longer than 3 days
    /*if (
      endsAt &&
      new Date(endsAt).getTime() >
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    ) {
      return res
        .status(400)
        .json({ message: "Giveaway can not run for longer than 3 days" });
    }*/

    giveaway = await prisma.giveaway.create({
      data: {
        name,
        network: network ? (network as BlockchainNetwork) : project.network,
        description: description ? description : project.description,
        endsAt: new Date(endsAt),
        slug: privateGiveaway ? `$${randomStringForEntropy(32)}` : slug,
        settings: settings as GiveawaySettings,
        status: GiveawayStatus.RUNNING,
        discordRoleId: giveawayRoleId,
        type: type as GiveawayType,
        rules: rules as GiveawayRule[],
        bannerUrl:
          bannerUrl && bannerUrl !== ""
            ? bannerUrl
            : project.bannerUrl
            ? project.bannerUrl
            : project.imageUrl,
        maxWinners,
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
        paymentToken: {
          connect: paymentTokenId
            ? {
                id: paymentTokenId,
              }
            : undefined,
        },
        paymentTokenAmount,
      },
    });
  }

  if (!giveaway) {
    return res.status(500).json({ message: "Internal server error" });
  }

  // call API to post to discord
  if (discordPost && !privateGiveaway) {
    try {
      console.log("posting giveaway to discord");

      // get the relevant channel

      if (project.network) {
        const channel = project.channelPostSettings.find(
          (x) =>
            x.network ===
            (network ? (network as BlockchainNetwork) : project.network)
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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    name,
    description,
    rules,
    type,
    endsAt,
    maxWinners,
    id,
    settings,
    network,
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

  const giveaway = await prisma.giveaway.findUnique({
    where: {
      id,
    },
    include: {
      collabProject: true,
      project: true,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  if (giveaway.collabProjectId && giveaway.collabProject) {
    const ruleIds = rules.map((x: GiveawayRule) => x.id);

    // this collab giveaway was created by us
    if (giveaway.projectId === project.id) {
      // if we are giving spots, then the rules that shouldn't be removed are the collab projects holder rules
      // else if we are receiving spots, then the rules that shouldn't be removed are the collab projects default rules
      const ruleIdsNotToRemove =
        giveaway.collabType === "GIVE_SPOTS"
          ? giveaway.collabProject.holderRules.map((x) => x.id)
          : giveaway.collabProject.defaultRules.map((x) => x.id);

      if (ruleIdsNotToRemove.length > 0) {
        if (!ruleIdsNotToRemove.every((x: string) => ruleIds.includes(x))) {
          return res.status(400).json({
            message:
              "Cannot remove rules belonging to the other project. Refresh and modify only your rules.",
          });
        }
      }
    } else {
      console.log("here");
      // giveaway was created by the other project, this means we shouldn't remove any rules belonging to the project
      const ruleIdsNotToRemove =
        giveaway.collabType === "GIVE_SPOTS"
          ? giveaway.project?.defaultRules.map((x) => x.id)
          : giveaway.project?.holderRules.map((x) => x.id);

      if (ruleIdsNotToRemove && ruleIdsNotToRemove.length > 0) {
        if (!ruleIdsNotToRemove.every((x: string) => ruleIds.includes(x))) {
          return res.status(400).json({
            message:
              "Cannot remove rules belonging to the other project. Refresh and modify only your rules.",
          });
        }
      }
    }
  }

  const updatedGiveaway = await prisma.giveaway.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      endsAt: new Date(endsAt),
      type: type as GiveawayType,
      rules: rules as GiveawayRule[],
      settings: settings as GiveawaySettings,
      network: network as BlockchainNetwork,
      maxWinners,
    },
  });

  // call API to edit post in discord
  if (updatedGiveaway.discordMessageId) {
    try {
      fetch(
        `${process.env.GIVEAWAYBOT_API}/edit?giveawaySlug=${updatedGiveaway.slug}`,
        {
          method: "GET",
        }
      );
    } catch (e) {
      console.log("Error editing giveaway in discord", e);
    }
  }

  res.status(200).json({ giveaway: updatedGiveaway });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "PUT":
      return createGiveaway(req, res);
    case "POST":
      return editGiveaway(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
