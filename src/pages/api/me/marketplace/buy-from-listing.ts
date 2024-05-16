import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  Account,
  MarketplaceActionType,
  MarketplaceRecord,
  Prisma,
  Project,
  User,
} from "@prisma/client";
import { addRole } from "@/backend/utils/addRole";
import { OAuthProviders } from "@/shared/types";
import { fetchUserGuilds } from "../running-giveaways";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

export const assignRole = async (
  guildId: string,
  userId: string,
  roleId: string
) => {
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
    console.log(`rate limited, trying again in ${addRoleResult.retry_after}ms`);
    await sleep(addRoleResult.retry_after);
    addRoleResult = await addRole(guildId, userId, roleId);
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
    return "An error occurred while processing your request - E2";
  }

  const userGuild = userGuilds.find(
    (x) => x === record.project.discordGuild?.id
  );

  if (!userGuild) {
    return "You must be in the Discord server for this project to buy this allowlist.";
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

  if (!record.allowlistEntryId) {
    return res
      .status(400)
      .json({ message: "This record does not have an allowlist entry id" });
  }

  if (record.processed || !record.listed) {
    return res
      .status(400)
      .json({ message: "This allowlist is no longer available for sale." });
  }

  // check if session user exists on allowlist entries
  const entry = record.project?.allowlist?.entries.find(
    (entry) => entry.userId === session.user.id
  );

  if (entry) {
    return res.status(400).json({
      message: "You are already on the allowlist for this project.",
    });
  }

  // check if user has enough points to buy
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.points) {
    return res.status(400).json({
      message: "You do not have enough points to buy this allowlist.",
    });
  }

  if (user.points < record.pointCost) {
    return res.status(400).json({
      message: "You do not have enough points to buy this allowlist.",
    });
  }

  // check if user has a default wallet for the project network
  const wallet = user.wallets.find(
    (x) => x.network === record.project.network && x.isDefault
  );

  if (!wallet) {
    return res.status(400).json({
      message: `You do not have a default wallet for this project's network. ${record.project.network}}`,
    });
  }

  // check if user has open listing for this project
  const openListing = await prisma.marketplaceRecord.findFirst({
    where: {
      createdByUserId: session.user.id,
      projectId: record.projectId,
      listed: true,
      processed: false,
    },
  });

  if (openListing) {
    return res.status(400).json({
      message:
        "Cannot buy as you already have an open listing for this project.",
    });
  }

  // check if allowlist exists and allowlist is enabled
  if (!record.project.allowlist || !record.project.allowlist.enabled) {
    // update marketplace record with error
    /* await prisma.marketplaceRecord.update({
      where: {
        id,
      },
      data: {
        listed: false,
        processed: false,
        error:
          "This allowlist is no longer available for sale as the allowlist submissions have been closed.",
      },
    });*/

    return res.status(400).json({
      message:
        "This allowlist is no longer available for sale as the allowlist submissions have been closed.",
    });
  }

  const seller = await prisma.user.findUnique({
    where: {
      id: record.createdByUserId,
    },
    include: {
      accounts: true,
    },
  });

  if (!seller) {
    return res.status(400).json({ message: "Seller not found" });
  }

  // if allowlist has a role, check if buyer and seller is in discord
  if ((record.project.allowlist?.roles?.length ?? 0) > 0) {
    const validationResult = await validateDiscordUser(user, record);
    if (validationResult) {
      return res.status(400).json({
        message: validationResult,
      });
    }

    /*    validationResult = await validateDiscordUser(seller, record);
    console.log(validationResult);

    if (validationResult) {
      // update marketplace record with error
      await prisma.marketplaceRecord.update({
        where: {
          id,
        },
        data: {
          listed: false,
          processed: false,
          error:
            "Seller is not in the Discord server for this project, this listing has been cancelled",
        },
      });

      return res.status(400).json({
        message:
          "Seller is not in the Discord server for this project, this listing has been cancelled",
      });
    }*/
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
    return res.status(500).json({
      message: "An error occurred while processing your request - E3",
    });
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
        id: session.user.id,
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
        id: record.createdByUserId,
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

    await prisma.marketplaceRecord.update({
      where: {
        id,
      },
      data: {
        listed: false,
        processed: false,
        error: "Error in updating points",
      },
    });

    return res.status(500).json({
      message: "An error occurred while processing your request - E1",
    });
  }
  // Handle the error as needed, e.g., return an error response or throw an exception.

  // if user has an open buy order for this project, then delist it
  const openBuyOrder = await prisma.marketplaceRecord.findFirst({
    where: {
      createdByUserId: session.user.id,
      listed: true,
      processed: false,
      projectId: record.projectId,
      tradeType: "BUY",
    },
  });

  if (openBuyOrder) {
    await prisma.marketplaceRecord.update({
      where: {
        id: openBuyOrder.id,
      },
      data: {
        listed: false,
        error: `Delisted as user purchased ${record.id}`,
      },
    });
  }

  // create a activity record for buy and sell
  await prisma.marketplaceActivity.create({
    data: {
      marketplaceRecordId: record.id,
      userId: session.user.id,
      action: MarketplaceActionType.BUY,
      projectId: record.projectId,
    },
  });

  await prisma.marketplaceActivity.create({
    data: {
      marketplaceRecordId: record.id,
      userId: record.createdByUserId,
      action: MarketplaceActionType.SALE,
      projectId: record.projectId,
    },
  });

  const allowlistEntry = await prisma.allowlistEntry.findUnique({
    where: {
      id: record.allowlistEntryId,
    },
  });

  if (!allowlistEntry) {
    {
      await prisma.marketplaceRecord.update({
        where: {
          id,
        },
        data: {
          error: "Allowlist entry not found, buyer did not get the allowlist",
        },
      });
      return res.status(500).json({
        message:
          "An error occurred while processing your request - E5 - Please raise a ticket in BSL discord.",
      });
    }
  }

  // update the allowlist entry to the buyer
  if (allowlistEntry) {
    await prisma.allowlistEntry.update({
      where: {
        id: allowlistEntry.id,
      },
      data: {
        userId: session.user.id,
        walletAddress: wallet.address,
      },
    });

    if (allowlistEntry.role && record.project.discordGuild) {
      const userDiscordAccount = user.accounts.find(
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
