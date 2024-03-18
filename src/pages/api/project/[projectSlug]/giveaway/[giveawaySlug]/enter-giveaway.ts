import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import {
  Account,
  GiveawayEntry,
  GiveawayStatus,
  GiveawayType,
} from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { checkAllRules } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";
import requestIp from "request-ip";
import { AES } from "crypto-js";
import { OAuthProviders } from "@/shared/types";

export type GiveawayEntryResponseData = {
  entry: GiveawayEntry | undefined;
  isSuccess: boolean;
  results: RuleResult[];
};

type GiveawayEntryErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GiveawayEntryResponseData | GiveawayEntryErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { giveawaySlug } = req.query;
  const { walletAddress } = JSON.parse(req.body);

  if (!giveawaySlug) {
    return res.status(400).json({ message: "Missing giveawaySlug" });
  }

  const giveaway = await prisma.giveaway.findFirst({
    where: {
      slug: giveawaySlug as string,
    },
  });

  if (!giveaway) {
    return res.status(404).json({ message: "Giveaway not found" });
  }

  if (giveaway.network !== "TBD" && !walletAddress) {
    return res.status(400).json({ message: "Missing walletAddress" });
  }

  /*const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });*/

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
    },
  });

  if (!accounts || accounts.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const giveawayEntry = await prisma.giveawayEntry.findFirst({
    where: {
      userId: session.user.id,
      giveawayId: giveaway.id,
    },
  });

  if (giveawayEntry) {
    return res
      .status(400)
      .json({ message: "User has already entered giveaway" });
  }

  const userIp = requestIp.getClientIp(req);

  let encryptedUserIp: string | undefined = undefined;
  if (userIp) {
    encryptedUserIp = AES.encrypt(
      userIp,
      process.env.NEXTAUTH_SECRET
    ).toString();
  }

  if (giveaway.settings && giveaway.settings.preventDuplicateIps) {
    if (encryptedUserIp) {
      // check for a giveaway entry for this giveaway and user ip
      const giveawayEntryIp = await prisma.giveawayEntry.findFirst({
        where: {
          giveawayId: giveaway.id,
          ipHash: encryptedUserIp,
        },
      });

      if (giveawayEntryIp) {
        return res.status(400).json({
          message: "You have already entered this giveaway from another IP.",
        });
      }
    }
  }

  if (giveaway.status !== GiveawayStatus.RUNNING) {
    return res.status(400).json({ message: "Giveaway is not running" });
  }

  const { results, errorMessage, isSuccess, uniqueConstraints } =
    await checkAllRules(giveaway, accounts);

  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  // create a new const called entryAmount and if results contains rule of type DISCORD_ROLE then set entryAmount to the multiplier of the rule else 1
  let entryAmount = 1;
  if (results.some((result) => result.rule.type === "DISCORD_ROLE")) {
    const discordRoleRule = results.find(
      (result) => result.rule.type === "DISCORD_ROLE"
    );
    entryAmount = discordRoleRule?.multiplier ?? 1;
  }

  let entry;
  if (isSuccess) {
    try {
      if (giveaway.type === "FCFS") {
        //  tx will fail if giveaway is full
        await prisma.$transaction(async (tx) => {
          entry = await tx.giveawayEntry.create({
            data: {
              uniqueConstraint: uniqueConstraints,
              giveaway: {
                connect: {
                  id: giveaway.id,
                },
              },
              user: {
                connect: {
                  id: session.user.id,
                },
              },
              isWinner: giveaway.type === GiveawayType.FCFS ? true : undefined,
              walletAddress: walletAddress as string,
              ipHash: encryptedUserIp,
              entryAmount,
              discordUserId: accounts.find(
                (account: Account) =>
                  account.provider === OAuthProviders.DISCORD
              )?.providerAccountId,
            },
          });
          const entriesCount = await tx.giveawayEntry.count({
            where: {
              giveawayId: giveaway.id,
            },
          });

          // winner check for fcfs
          if (entriesCount > giveaway.maxWinners) {
            console.log("More entries than maxWinners", {
              entriesCount,
              maxWinners: giveaway.maxWinners,
            });

            throw new Error("Giveaway is full");
          }

          //  if giveaway is full, set status to closed
          if (entriesCount >= giveaway.maxWinners) {
            await tx.giveaway.update({
              where: {
                id: giveaway.id,
              },
              data: {
                status: GiveawayStatus.FINALIZED,
                endsAt: new Date(),
              },
            });
          }
        });
      }

      if (giveaway.type === "RAFFLE") {
        entry = await prisma.giveawayEntry.create({
          data: {
            uniqueConstraint: uniqueConstraints,
            giveaway: {
              connect: {
                id: giveaway.id,
              },
            },
            user: {
              connect: {
                id: session.user.id,
              },
            },
            isWinner: undefined,
            walletAddress: walletAddress as string,
            ipHash: encryptedUserIp,
            entryAmount,
            discordUserId: accounts.find(
              (account: Account) => account.provider === OAuthProviders.DISCORD
            )?.providerAccountId,
          },
        });
      }
    } catch (error) {
      console.log("Error creating entry", (error as Error).message);

      return res.status(400).json({
        message: "Failed to join, please try again in a few minutes.",
      });
    }

    await prisma.giveaway.update({
      where: {
        id: giveaway.id,
      },
      data: {
        entryCount: {
          increment: 1,
        },
      },
    });
  }

  return res.status(200).json({ entry, results, isSuccess });
}
