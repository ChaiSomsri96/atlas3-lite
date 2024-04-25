import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { Lottery, LotteryWinners } from "@prisma/client";

export type ExtendedLottery = {
  winners: LotteryWinners[];
} & Lottery;

export type PreviousLotteriesResp = {
  lotteries: ExtendedLottery[];
};

export const usePreviousLotteries = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<PreviousLotteriesResp>(
    [PROJECT_KEY, "previousLotteries", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/previousLotteries`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        lotteries: data.lotteries,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
