import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { GiveawayEntry, GiveawayStatus, GiveawayType } from "@prisma/client";
import { checkAllRules } from "@/backend/giveaway-rules";
import { RuleResult } from "@/backend/giveaway-rules/types";
import requestIp from "request-ip";
import { AES } from "crypto-js";

export type GiveawayEntryResponseData = {
  entry: GiveawayEntry | undefined;
  isSuccess: boolean;
  results: RuleResult[];
};

type GiveawayEntryErrorData = {
  message: string;
  error?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GiveawayEntryResponseData | GiveawayEntryErrorData>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { giveawaySlug } = req.query;
  const { discordUserId } = JSON.parse(req.body);

  try {
    if (!discordUserId) {
      return res.status(400).json({ message: "Missing discordUserId" });
    }

    if (!giveawaySlug) {
      return res.status(400).json({ message: "Missing giveawaySlug" });
    }

    const giveaway = await prisma.giveaway.findFirst({
      where: {
        slug: giveawaySlug as string,
      },
      include: {
        project: true,
        paymentToken: true,
      },
    });

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    if (giveaway.paymentToken) {
      return res.status(400).json({
        message: `This giveaway costs ${giveaway.paymentTokenAmount} $${giveaway.paymentToken.tokenName} to join, please enter through the Atlas3 website.`,
      });
    }

    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          providerAccountId: discordUserId,
          provider: "discord",
        },
      },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const giveawayEntries = await prisma.giveawayEntry.findMany({
      where: {
        giveawayId: giveaway.id,
        userId: account.userId,
      },
    });

    if (giveawayEntries.length > 0) {
      return res
        .status(400)
        .json({ message: "User has already entered giveaway" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: account.userId,
      },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (giveaway.status !== GiveawayStatus.RUNNING) {
      return res.status(400).json({ message: "Giveaway is not running" });
    }

    const { results, errorMessage, isSuccess } = await checkAllRules(
      giveaway,
      user.accounts
    );

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

    let walletAddress = "";

    if (giveaway.network !== "TBD") {
      walletAddress =
        user.wallets.find(
          (x) =>
            x.isDefault &&
            x.network === (giveaway.network ?? giveaway.project?.network)
        )?.address ?? "";

      if (!walletAddress || walletAddress === "") {
        return res.status(400).json({
          message: `Default wallet address is not configured for ${
            giveaway.network ?? giveaway.project?.network
          }`,
        });
      }
    }

    const userIp = requestIp.getClientIp(req);

    let encryptedUserIp: string | undefined = undefined;
    if (userIp) {
      encryptedUserIp = AES.encrypt(
        userIp,
        process.env.NEXTAUTH_SECRET
      ).toString();
    }

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

    let entry;
    if (isSuccess) {
      if (giveaway.type === "FCFS") {
        await prisma.$transaction(async (tx) => {
          entry = await tx.giveawayEntry.create({
            data: {
              giveaway: {
                connect: {
                  id: giveaway.id,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
              isWinner: giveaway.type === GiveawayType.FCFS ? true : undefined,
              walletAddress: walletAddress as string,
              ipHash: encryptedUserIp,
              processing: false,
              entryAmount,
              discordUserId: discordUserId,
            },
          });

          if (giveaway.type === GiveawayType.FCFS) {
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
          }
        });
      }

      if (giveaway.type === "RAFFLE") {
        entry = await prisma.giveawayEntry.create({
          data: {
            giveaway: {
              connect: {
                id: giveaway.id,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            isWinner: undefined,
            walletAddress: walletAddress as string,
            ipHash: encryptedUserIp,
            processing: false,
            entryAmount,
            discordUserId: discordUserId,
          },
        });
      }
    }

    if (entry) {
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
  } catch (ex) {
    console.log(`error entering for ${discordUserId} for ${giveawaySlug}}`);
    return res.status(500).json({
      message:
        "Error entering giveaway. Please try again, if that does not work then please enter through the Atlas3 website.",
      error: ex,
    });
  }
}
