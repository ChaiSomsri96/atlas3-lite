import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type ForgeStakedResp = {
  stakedForge: number;
};

export const useStakedForge = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<ForgeStakedResp>(
    [PROJECT_KEY, "stakedForge", session?.user?.id],
    async () => {
      const response = await fetch(`/api/me/stakedForge`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        stakedForge: data.stakedForge,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
