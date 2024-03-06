import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { Lottery } from "@prisma/client";

export type PreviousLotteryResp = {
  jackpots: Lottery[];
};

export const usePreviousJackpots = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<PreviousLotteryResp>(
    [PROJECT_KEY, "previousJackpots", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/previousJackpots`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        jackpots: data.lotteries,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
