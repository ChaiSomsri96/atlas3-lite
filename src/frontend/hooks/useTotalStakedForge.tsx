import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type TotalForgeStakedResp = {
  totalForgeStaked: number;
};

export const useTotalStakedForge = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<TotalForgeStakedResp>(
    [PROJECT_KEY, "stakedForge", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/totalForgeStaked`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        totalForgeStaked: data.totalForgeStaked,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};