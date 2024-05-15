import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { MarketplaceActionType } from "@prisma/client";
import { addRole } from "@/backend/utils/addRole";
import { OAuthProviders } from "@/shared/types";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const assignRole = async (guildId: string, userId: string, roleId: string) => {
  let addRoleResult = await addRole(guildId, userId, roleId);

  console.log(addRoleResult);

  if (addRoleResult && addRoleResult.message) {
    return {
      message: "Error assigning role.",
    };
  }

  if (addRoleResult === "") {
    return {
      message: "",
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

const delistRecord = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions)

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

  // get marketpalce record and see if it belongs to user
  const record = await prisma.marketplaceRecord.findUnique({
    where: {
      id,
    },
    include: {
      project: true,
    },
  });

  if (!record) {
    return res.status(400).json({ message: "Marketplace record not found" });
  }

  if (record.createdByUserId !== session.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const marketplaceRecord = await prisma.marketplaceRecord.updateMany({
    where: {
      id,
      listed: true,
      processed: false,
    },
    data: {
      listed: false,
    },
  });

  if (!marketplaceRecord.count) {
    return res
      .status(400)
      .json({ message: "Cannot delist a listing that has been sold." });
  }

  if (record.tradeType === "SELL" && record.allowlistEntryId) {
    // give role back
    const allowlistEntry = await prisma.allowlistEntry.findUnique({
      where: {
        id: record.allowlistEntryId,
      },
    });

    if (allowlistEntry && allowlistEntry.role && record.project.discordGuild) {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        include: {
          accounts: true,
        },
      });

      const userDiscordAccount = user?.accounts.find(
        (x) => x.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount) {
        const assignRoleResult = await assignRole(
          record.project.discordGuild?.id,
          userDiscordAccount.providerAccountId,
          allowlistEntry.role?.id
        );

        if (assignRoleResult && assignRoleResult.message !== "") {
          return res.status(400).json({ message: assignRoleResult.message });
        }
      }
    }
  }

  // update allowlist entry back to this user
  if (record.tradeType === "SELL" && record.allowlistEntryId) {
    await prisma.allowlistEntry.update({
      where: {
        id: record.allowlistEntryId,
      },
      data: {
        userId: record.createdByUserId,
      },
    });
  }

  await prisma.marketplaceActivity.create({
    data: {
      marketplaceRecordId: record.id,
      userId: record.createdByUserId,
      action: MarketplaceActionType.DELIST,
      projectId: record.projectId,
    },
  });

  res.status(200).json({ success: true });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  switch (req.method) {
    case "POST":
      return delistRecord(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
