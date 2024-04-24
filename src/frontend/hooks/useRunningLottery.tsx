import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { Lottery } from "@prisma/client";

export type RunningRafflesResp = {
  lottery: Lottery;
};

export const useRunningLottery = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<RunningRafflesResp>(
    [PROJECT_KEY, "liveLottery", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/running`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        lottery: data.lottery,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
