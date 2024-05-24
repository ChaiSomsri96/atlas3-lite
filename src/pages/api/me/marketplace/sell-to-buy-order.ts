import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  Account,
  Allowlist,
  AllowlistEntry,
  MarketplaceActionType,
  MarketplaceRecord,
  Prisma,
  Project,
  User,
} from "@prisma/client";
import { addRole } from "@/backend/utils/addRole";
import { deleteRole } from "@/backend/utils/deleteRole";
import { OAuthProviders } from "@/shared/types";
import { fetchUserGuilds } from "../running-giveaways";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

const assignRole = async (guildId: string, userId: string, roleId: string) => {
  let addRoleResult = await addRole(guildId, userId, roleId);

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
    addRoleResult = await addRole(guildId, userId, roleId);
  }
};

const removeRole = async (guildId: string, userId: string, roleId: string) => {
  let addRoleResult = await deleteRole(guildId, userId, roleId);

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
    addRoleResult = await deleteRole(guildId, userId, roleId);
  }
};

async function validateDiscordUser(
  user: User & { accounts: Account[] },
  record: MarketplaceRecord & {
    project: Project;
  }
): Promise<string | null> {
  const buyerDiscordAccount = user.accounts.find(
    (x) => x.provider === OAuthProviders.DISCORD
  );

  if (!buyerDiscordAccount || !buyerDiscordAccount.access_token) {
    return "You must have a Discord account linked to your account.";
  }

  const userGuilds = await fetchUserGuilds(
    buyerDiscordAccount.access_token,
    buyerDiscordAccount,
    false
  );

  if (!userGuilds) {
    return "An error occurred while processing your request";
  }

  const userGuild = userGuilds.find(
    (x) => x === record.project.discordGuild?.id
  );

  if (!userGuild) {
    return "You must be in the Discord server for this project to buy this allowlist.";
  }

  return null;
}

type MemberInfo = {
  roles: string[];
};

async function validateDiscordUserAndRoles(
  user: User & { accounts: Account[] },
  project: Project & {
    allowlist: (Allowlist & { entries: AllowlistEntry[] }) | null;
  },
  allowlistEntry: AllowlistEntry | undefined
): Promise<string | null> {
  const buyerDiscordAccount = user.accounts.find(
    (x) => x.provider === OAuthProviders.DISCORD
  );

  if (!buyerDiscordAccount || !buyerDiscordAccount.access_token) {
    return "You must have a Discord account linked to your account.";
  }

  if (!allowlistEntry) {
    return "Allowlist entry not found";
  }

  if (!project.discordGuild) {
    return "Discord server not found";
  }

  if (!project.allowlist) {
    return "Allowlist not found";
  }

  // Fetch Discord Guild Information from the Discord API
  const userDiscordGuildsRes = await fetch(
    `https://discord.com/api/guilds/${project.discordGuild.id}/members/${buyerDiscordAccount.providerAccountId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const userDiscordGuilds: MemberInfo = await userDiscordGuildsRes.json();

  if (!userDiscordGuildsRes.ok) {
    return "Error fetching listings";
  }

  if (!userDiscordGuilds) {
    return "You are not apart of the discord server to make this listing.";
  }

  if (allowlistEntry && !allowlistEntry.role) {
    return "Allowlist entry role not found";
  }

  const userDiscordGuildRoles = userDiscordGuilds.roles;

  const allowlistRole = project.allowlist.roles.find(
    (x) => x.id === allowlistEntry.role?.id
  );

  if (!allowlistRole) {
    return "Role is not in the allowlist";
  }

  if (!userDiscordGuildRoles.includes(allowlistRole.id)) {
    return "You do not have the correct role to make this listing.";
  }

  return null;
}

const processSale = async (
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

  const { id } = JSON.parse(req.body);

  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  const record = await prisma.marketplaceRecord.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          allowlist: {
            include: {
              entries: true,
            },
          },
        },
      },
    },
  });

  if (!record) {
    return res.status(400).json({ message: "Marketplace record not found" });
  }

  if (!record.walletAddress)
    return res.status(400).json({ message: "Wallet address not found" });

  if (!record.project) {
    return res.status(400).json({ message: "Project not found" });
  }

  // check if session user exists on allowlist entries
  const allowlistEntry = record.project?.allowlist?.entries.find(
    (entry) => entry.userId === session.user.id
  );

  if (!allowlistEntry) {
    return res.status(400).json({
      message: "You are not on the allowlist for this project.",
    });
  }

  if (record.role) {
    if (allowlistEntry.role?.id !== record.role.id) {
      return res.status(400).json({
        message: "You do not have the correct role for this sale.",
      });
    }
  }

  // check if seller has enough points to buy
  const buyer = await prisma.user.findUnique({
    where: {
      id: record.createdByUserId,
    },
    include: {
      accounts: true,
    },
  });

  if (!buyer || !buyer.points || buyer.points < record.pointCost) {
    // delist the record
    await prisma.marketplaceRecord.update({
      where: {
        id,
      },
      data: {
        listed: false,
        processed: false,
        error: "Buyer does not have enough points to buy this allowlist.",
      },
    });

    return res.status(400).json({
      message:
        "Buyer does not have enough points to buy this allowlist. This listing has been cancelled.",
    });
  }

  // check if user has a default wallet for the project network
  const wallet = buyer.wallets.find(
    (x) => x.network === record.project.network && x.isDefault
  );

  if (!wallet) {
    return res.status(400).json({
      message: `You do not have a default wallet for this project's network. ${record.project.network}}`,
    });
  }

  // check if allowlist exists and allowlist is enabled
  if (!record.project.allowlist || !record.project.allowlist.enabled) {
    // update marketplace record with error
    await prisma.marketplaceRecord.update({
      where: {
        id,
      },
      data: {
        listed: false,
        processed: false,
        error:
          "This allowlist is no longer available for sale as the allowlist submissions have been closed.",
      },
    });

    return res.status(400).json({
      message:
        "This allowlist is no longer available for sale as the allowlist submissions have been closed.",
    });
  }

  // check buyer doesn't already have allowlist
  const existingBuyerEntry = await prisma.allowlistEntry.findFirst({
    where: {
      userId: buyer.id,
      allowlistId: record.project.allowlist.id,
    },
  });

  if (existingBuyerEntry) {
    // update marketplace record with error
    await prisma.marketplaceRecord.update({
      where: {
        id,
      },
      data: {
        listed: false,
        processed: false,
        error: "Buyer already has an allowlist entry for this project.",
      },
    });

    return res.status(400).json({
      message:
        "Buyer already has an allowlist for this project. Listing has been cancelled",
    });
  }

  const seller = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });

  if (!seller) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // if allowlist has a role, check if buyer and seller is in discord
  if (record.role) {
    if ((record.project.allowlist?.roles?.length ?? 0) > 0) {
      let validationResult = await validateDiscordUserAndRoles(
        seller,
        record.project,
        allowlistEntry
      );
      if (validationResult) {
        return res.status(400).json({
          message: "You do not meet the criteria to sell to this order.",
        });
      }

      validationResult = await validateDiscordUser(buyer, record);

      if (validationResult) {
        // update marketplace record with error
        await prisma.marketplaceRecord.update({
          where: {
            id,
          },
          data: {
            listed: false,
            processed: false,
            error: validationResult,
          },
        });

        return res.status(400).json({
          message:
            "Buyer is not in the Discord server for this project, this listing has been cancelled",
        });
      }
    }
  }

  // create lock
  try {
    await prisma.marketplaceRecordLocks.create({
      data: {
        marketplaceRecordId: id,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(404)
          .json({ message: "This allowlist has already been sold." });
      }
    }
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }

  const recordsUpdated = await prisma.marketplaceRecord.updateMany({
    where: {
      id,
      listed: true,
      processed: false,
    },
    data: {
      listed: false,
      processed: true,
    },
  });

  // release the lock
  await prisma.marketplaceRecordLocks.delete({
    where: {
      marketplaceRecordId: id,
    },
  });

  if (!recordsUpdated.count) {
    return res
      .status(400)
      .json({ message: "This allowlist is no longer available for sale." });
  }

  try {
    // deduct points from buyer
    const deductPointsFromBuyer = prisma.user.update({
      where: {
        id: record.createdByUserId,
      },
      data: {
        points: {
          decrement: record.pointCost,
        },
      },
    });

    const bslPoints = Math.round(record.pointCost * 0.03); // 3% for BSL project
    const projectPoints = Math.round(record.pointCost * 0.02); // 2% for the project
    const sellerPoints = record.pointCost - (bslPoints + projectPoints); // Rest for the seller

    // increment points for project
    const incrementPointsForProject = prisma.project.update({
      where: {
        id: record.projectId,
      },
      data: {
        accumulatedPoints: {
          increment: projectPoints,
        },
      },
    });

    // increment points for BSL project
    const incrementPointsForBSL = prisma.project.update({
      where: {
        id: process.env.BSL_ID as string,
      },
      data: {
        accumulatedPoints: {
          increment: bslPoints,
        },
      },
    });

    // increment points for seller
    const incrementPointsForSeller = prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        points: {
          increment: sellerPoints,
        },
      },
    });

    await prisma.$transaction([
      deductPointsFromBuyer,
      incrementPointsForProject,
      incrementPointsForBSL,
      incrementPointsForSeller,
    ]);
  } catch (error) {
    console.error("Error in updating points:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request" });
  }

  // create a activity record for buy and sell
  await prisma.marketplaceActivity.create({
    data: {
      marketplaceRecordId: record.id,
      userId: session.user.id,
      action: MarketplaceActionType.SALE,
      projectId: record.projectId,
    },
  });

  await prisma.marketplaceActivity.create({
    data: {
      marketplaceRecordId: record.id,
      userId: record.createdByUserId,
      action: MarketplaceActionType.BUY,
      projectId: record.projectId,
    },
  });

  // update the allowlist entry to the buyer
  if (allowlistEntry) {
    await prisma.allowlistEntry.update({
      where: {
        id: allowlistEntry.id,
      },
      data: {
        userId: record.createdByUserId,
        walletAddress: record.walletAddress ?? null,
      },
    });

    if (allowlistEntry.role && record.project.discordGuild) {
      const userDiscordAccount = buyer.accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount) {
        // assign role to buyer
        await assignRole(
          record.project.discordGuild.id,
          userDiscordAccount.providerAccountId,
          allowlistEntry.role.id
        );
      }

      const sellerDiscordAccount = seller?.accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (sellerDiscordAccount && record.project.allowlist) {
        // remove all roles from seller from allowlist.roles
        for (const role of record.project.allowlist.roles) {
          await removeRole(
            record.project.discordGuild.id,
            sellerDiscordAccount?.providerAccountId,
            role.id
          );
        }
      }
    }
  }

  res.status(200).json({ success: true });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "POST":
      return processSale(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
