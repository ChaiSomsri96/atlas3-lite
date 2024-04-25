import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { LotteryWinners } from "@prisma/client";

export type PreviousLotteryWinnersResp = {
  winners: LotteryWinners[];
};

export const usePreviousLotteryWinners = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<PreviousLotteryWinnersResp>(
    [PROJECT_KEY, "previousWinners", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/previousWinners`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        winners: data.winners,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
