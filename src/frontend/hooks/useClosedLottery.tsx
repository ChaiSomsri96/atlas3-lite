/*import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { ExtendedLottery } from "./useRunningLottery";

export type RunningRafflesResp = {
  lotteries: ExtendedLottery[];
  total: number;
};

export const useClosedLottery = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<RunningRafflesResp>(
    [PROJECT_KEY, "closedLottery", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/closed`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lotteries");
      }

      const data = await response.json();

      return {
        lotteries: data.lotteries,
        total: data.total,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
*/

export {};
