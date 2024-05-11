import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import {
  AllowlistRole,
  AllowlistType,
  DiscordGuild,
  Project,
} from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { isUserAdmin } from "@/backend/utils";
import { OAuthProviders } from "@/shared/types";
import { assignRole } from "@/pages/api/me/marketplace/buy-from-listing";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ResponseData = {
  project: Project;
};

type ErrorData = {
  message: string;
};

const addRole = async (guildId: string, userId: string, roleId: string) => {
  const addRoleRes = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const resText = await addRoleRes.text();
  if (resText) {
    return JSON.parse(resText);
  }
};

const addRoleToUser = async (
  type: AllowlistType,
  userId: string,
  roles: [{ id: string }],
  discordGuild: DiscordGuild | null
) => {
  // assign these roles to this user to see if the bot is above the roles
  if (type === AllowlistType.DISCORD_ROLE) {
    if (!discordGuild) {
      return { message: "Project has no Discord guild" };
    }

    const userDiscordAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: OAuthProviders.DISCORD,
      },
    });

    if (!userDiscordAccount) {
      return { message: "Missing Discord account" };
    }

    for (const role of roles) {
      let addRoleResult = await addRole(
        discordGuild.id,
        userDiscordAccount.providerAccountId,
        role.id
      );

      if (addRoleResult && addRoleResult.message === "Missing Permissions") {
        return {
          message:
            "Missing Permissions. Make sure bot is placed above the role you are trying to assign in your server settings.",
        };
      }

      while (
        addRoleResult &&
        addRoleResult.message &&
        addRoleResult.message === "You are being rate limited."
      ) {
        await sleep(addRoleResult.retry_after);
        addRoleResult = await addRole(
          discordGuild.id,
          userDiscordAccount.providerAccountId,
          role.id
        );

        if (addRoleResult.message === "Missing Permissions") {
          return {
            message:
              "Missing Permissions. Make sure bot is placed above the role you are trying to assign.",
          };
        }
      }
    }
  }

  return {};
};

const createWalletCollection = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;
  const { type, closesAt, maxCap, roles } = JSON.parse(req.body);

  if (!type || !Object.keys(AllowlistType).includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === AllowlistType.DISCORD_ROLE && !roles) {
    return res.status(400).json({ message: "Missing roles" });
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

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project already has an allowlist" });
  }

  if (type === AllowlistType.DISCORD_ROLE && (!roles || roles.length === 0)) {
    return res.status(400).json({ message: "Missing roles" });
  }

  // assign these roles to this user to see if the bot is above the roles
  const addRoleResult = await addRoleToUser(
    type,
    session.user.id,
    roles,
    project.discordGuild
  );

  if (addRoleResult.message) {
    return res.status(403).json({ message: addRoleResult.message });
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      allowlist: {
        create: {
          enabled: false,
          type: type as AllowlistType,
          closesAt,
          maxCap,
          roles,
        },
      },
    },
  });

  res.status(200).json({ project: updatedProject });
};

const updateWalletCollection = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;
  const { type, closesAt, maxCap, roles, enabled } = JSON.parse(req.body);

  if (type && !Object.keys(AllowlistType).includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  if (type === AllowlistType.DISCORD_ROLE && !roles) {
    return res.status(400).json({ message: "Missing roles" });
  }

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (enabled && project.network === "TBD") {
    return res.status(400).json({
      message:
        "Cannot enable allowlist where the project network is set to TBD.",
    });
  }

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  if (maxCap && project.allowlist._count.entries > maxCap) {
    return res.status(400).json({
      message: "Max cap cannot be lower than the number of entries",
    });
  }

  const rolesHaveChanged = (
    oldRoles: AllowlistRole[],
    newRoles: AllowlistRole[]
  ): boolean => {
    const rolesAreEqual = (role1: AllowlistRole, role2: AllowlistRole) =>
      role1.id === role2.id && role1.name === role2.name;
    const roleExistsInArray = (role: AllowlistRole, array: AllowlistRole[]) =>
      array.some((r) => rolesAreEqual(r, role));

    // Check if any existing role is not found in the new set of roles
    if (oldRoles.some((role) => !roleExistsInArray(role, newRoles))) {
      return true;
    }

    return false;
  };

  if (roles && roles.length > 0) {
    if (rolesHaveChanged(roles, project.allowlist.roles)) {
      // check any open listings for this project
      const listings = await prisma.marketplaceRecord.findMany({
        where: {
          projectId: project.id,
          listed: true,
        },
      });

      if (listings.length > 0) {
        return res.status(400).json({
          message:
            "Cannot change roles when there are open listings on the marketplace. Please raise a ticket in Blocksmith Labs discord for assistance.",
        });
      }
    }
  }

  // assign these roles to this user to see if the bot is above the roles
  const addRoleResult = await addRoleToUser(
    type,
    session.user.id,
    roles,
    project.discordGuild
  );

  if (addRoleResult.message) {
    return res.status(403).json({ message: addRoleResult.message });
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      allowlist: {
        update: {
          enabled:
            typeof enabled === "boolean" ? enabled : project.allowlist.enabled,
          type:
            typeof type === "string"
              ? (type as AllowlistType)
              : project.allowlist.type,
          closesAt:
            typeof closesAt === "string"
              ? closesAt
              : project.allowlist.closesAt,
          maxCap:
            typeof maxCap === "number" ? maxCap : project.allowlist.maxCap,
          roles: roles && roles.length > 0 ? roles : project.allowlist.roles,
        },
      },
    },
  });


  if (enabled === false) {
    const listedRecords = await prisma.marketplaceRecord.findMany({
      where: {
        projectId: project.id,
        listed: true,
        processed: false,
      },
    });

    // loop through each one and set the allowlist entry from this record back to the user id of the listed
    for (const record of listedRecords) {
      if (record.allowlistEntryId) {
        await prisma.allowlistEntry.update({
          where: {
            id: record.allowlistEntryId,
          },
          data: {
            userId: record.createdByUserId,
          },
        });

        const allowlistEntry = await prisma.allowlistEntry.findUnique({
          where: {
            id: record.allowlistEntryId,
          },
        });

        if (allowlistEntry && allowlistEntry.role && project.discordGuild) {
          const user = await prisma.account.findFirst({
            where: {
              userId: record.createdByUserId,
              provider: "discord",
            },
          });

          if (user) {
            await assignRole(
              project.discordGuild.id,
              user.providerAccountId,
              allowlistEntry.role.id
            );
          }
        }
      }
    }

    // set all marketplace record listed to false
    await prisma.marketplaceRecord.updateMany({
      where: {
        projectId: project.id,
        listed: true,
      },
      data: {
        listed: false,
        error: "Project disabled allowlist collection.",
      },
    });
  }

  res.status(200).json({ project: updatedProject });
};

const deleteWalletCollection = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;

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

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  // delete allowlist entries
  await prisma.allowlistEntry.deleteMany({
    where: {
      allowlistId: project.allowlist.id,
    },
  });

  res.status(200).json({ project: project });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "PUT":
      return createWalletCollection(req, res);
    case "POST":
      return updateWalletCollection(req, res);
    case "DELETE":
      return deleteWalletCollection(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
