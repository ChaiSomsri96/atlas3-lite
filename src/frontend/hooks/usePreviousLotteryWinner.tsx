import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { ExtendedLottery } from "./usePreviousLotteries";

export type PreviousLotteryResp = {
  lottery: ExtendedLottery;
  exists: boolean;
};

export const usePreviousLotteryWinner = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<PreviousLotteryResp>(
    [PROJECT_KEY, "previousLotteryWinner", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/previousWinner`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        lottery: data.lottery,
        exists: data.exists,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
