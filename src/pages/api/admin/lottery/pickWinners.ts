import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { Account, Lottery, User } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { OAuthProviders } from "@/shared/types";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

export type EligibleUser = User & {
  accounts: Account[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const lottery = await prisma.lottery.findFirst({
    where: {
      status: "RUNNING",
    },
  });

  if (!lottery) {
    return res.status(404).json({ message: "Lottery not found" });
  }

  const eligibleUsers = await prisma.user.findMany({
    where: {
      forgeStaked: {
        gt: 0,
      },
    },
    include: {
      accounts: true,
    },
  });

  if (eligibleUsers.length === 0) {
    return res.status(404).json({ message: "No entries found" });
  }

  await pickUsdRewardWinners(eligibleUsers, lottery);
  await pickLotteryPrizeWinners(eligibleUsers, lottery);
  const jackpotWon = await determineJackpotWinner(
    eligibleUsers,
    0.0343,
    lottery
  );

  // update lottery to finalized and processed true
  await prisma.lottery.update({
    where: {
      id: lottery.id,
    },
    data: {
      status: "FINALIZED",
      processed: true,
      endsAt: new Date(),
      jackpotWon: jackpotWon,
    },
  });

  res.status(200).json({ success: true });
}

function distributeRewards(
  totalReward: number,
  numberOfWinners: number
): number[] {
  const rewards: number[] = [];
  let remainingReward = totalReward;

  // Let's assume we'll give 40% of the remaining reward to the next winner.
  const proportion = 0.4;

  for (let i = 0; i < numberOfWinners; i++) {
    const share = remainingReward * proportion;
    const roundedShare = Math.round(share * 100) / 100;
    rewards.push(roundedShare);
    remainingReward -= roundedShare;
  }

  // Adjust discrepancies caused by rounding
  const discrepancy = totalReward - rewards.reduce((acc, val) => acc + val, 0);
  if (discrepancy !== 0 && rewards.length > 0) {
    rewards[rewards.length - 1] += discrepancy;
  }

  return rewards;
}

async function createWinnerEntry(
  lottery: Lottery,
  user: EligibleUser,
  prizeWon: string,
  jackpotWon = false
) {
  if (user && lottery) {
    const discordAccount = user.accounts.find(
      (account: Account) => account.provider === OAuthProviders.DISCORD
    );

    // trim off everything after the hashtag and including it in the discordAccount.username
    const nameWithoutHashtag = discordAccount?.username?.split("#")[0] ?? "";

    await prisma.lotteryWinners.create({
      data: {
        lottery: {
          connect: {
            id: lottery.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        prizeWon,
        walletAddress:
          user.wallets?.find(
            (x) => x.isDefault && x.network === lottery.network
          )?.address ?? "",
        jackpotWon: jackpotWon,
        stakedForgeAtTheTime: user.forgeStaked ?? 0,
        discordUserId: discordAccount?.providerAccountId ?? "",
        username: nameWithoutHashtag ?? "",
        userImage: discordAccount?.image ?? "",
      },
    });
  }
}

async function pickUsdRewardWinners(
  entries: EligibleUser[],
  lottery: Lottery
): Promise<EligibleUser[]> {
  const maxWinnersForUsd = 5;

  const maxForgeEntered = Math.max(...entries.map((e) => e.forgeStaked ?? 0));
  const winners: EligibleUser[] = [];
  const consideredEntries = [...entries];

  let attempts = 0; // Counter to prevent infinite loop
  const maxAttempts = maxWinnersForUsd * 10; // Arbitrary number, adjust as needed

  while (winners.length < maxWinnersForUsd && attempts < maxAttempts) {
    const randomIndex = Math.floor(Math.random() * consideredEntries.length);
    const randomEntry = consideredEntries[randomIndex];

    if (Math.random() < (randomEntry.forgeStaked ?? 0) / maxForgeEntered) {
      winners.push(randomEntry);
      // Do not remove the winner from the list
    }

    attempts++;
  }

  const shuffledWinners = shuffleArray(winners);

  // Distribute rewards
  const rewards = distributeRewards(lottery.usdReward, maxWinnersForUsd);
  for (let i = 0; i < shuffledWinners.length; i++) {
    await createWinnerEntry(
      lottery,
      shuffledWinners[i],
      `${rewards[i].toFixed(2)} USD`
    );
  }

  return winners;
}

async function pickLotteryPrizeWinners(
  entries: EligibleUser[],
  lottery: Lottery
): Promise<EligibleUser[]> {
  const maxForgeEntered = Math.max(...entries.map((e) => e.forgeStaked ?? 0));
  const lotteryPrizeWinners: EligibleUser[] = [];
  const consideredEntries = [...entries];
  const userPrizesWon: Record<string, string[]> = {}; // To track prizes won by each user

  let failedAttempts = 0;
  const maxFailedAttempts = entries.length * 10000; // Arbitrary threshold, adjust as needed

  // Function to check if there are still prizes with quantities left
  const arePrizesAvailable = () => {
    return lottery.lotteryPrizes.some((prize) => prize.quantity > 0);
  };

  while (
    lotteryPrizeWinners.length < lottery.maxWinners &&
    arePrizesAvailable() &&
    failedAttempts < maxFailedAttempts
  ) {
    const randomIndex = Math.floor(Math.random() * consideredEntries.length);
    const randomEntry = consideredEntries[randomIndex];

    if (Math.random() < (randomEntry.forgeStaked ?? 0) / maxForgeEntered) {
      const prize = lottery.lotteryPrizes[0]; // Look at the next available prize without removing it yet

      if (
        prize &&
        prize.quantity > 0 &&
        (!userPrizesWon[randomEntry.id] ||
          !userPrizesWon[randomEntry.id].includes(prize.name))
      ) {
        // If the user hasn't won this prize before, award it
        await createWinnerEntry(lottery, randomEntry, prize.name);
        lotteryPrizeWinners.push(randomEntry);

        // Decrement the prize quantity
        prize.quantity--;

        // If the prize quantity is now 0, remove it from the list
        if (prize.quantity === 0) {
          lottery.lotteryPrizes.shift();
        }

        // Track the prize won by the user
        if (!userPrizesWon[randomEntry.id]) {
          userPrizesWon[randomEntry.id] = [];
        }
        userPrizesWon[randomEntry.id].push(prize.name);
        failedAttempts = 0; // Reset the counter since we found a winner
      } else {
        failedAttempts++; // Increment the counter for failed attempts
      }
    }
  }

  if (failedAttempts >= maxFailedAttempts) {
    console.warn("Exceeded maximum attempts to find a winner. Exiting early.");
  }

  return lotteryPrizeWinners;
}

async function determineJackpotWinner(
  entries: EligibleUser[],
  winChance: number,
  lottery: Lottery
): Promise<boolean> {
  // Determine if the jackpot is won at all
  if (Math.random() < winChance) {
    // If won, select a random entrant as the winner
    const randomIndex = Math.floor(Math.random() * entries.length);

    await createWinnerEntry(
      lottery,
      entries[randomIndex],
      `${lottery.jackpotPrizes.map((x) => x.name).join(",")}`,
      true
    );

    return true;
  }

  return false;
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
