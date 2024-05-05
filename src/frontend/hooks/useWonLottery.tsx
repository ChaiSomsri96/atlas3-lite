/*import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { ExtendedLottery } from "./useRunningLottery";

export type RunningRafflesResp = {
  lotteries: ExtendedLottery[];
  total: number;
};

export const useWonLottery = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<RunningRafflesResp>(
    [PROJECT_KEY, "wonLottery", session?.user?.id],
    async () => {
      const response = await fetch(`/api/lottery/won`);

      if (!response.ok) {
        throw new Error("Failed to fetch running lottery");
      }

      const data = await response.json();

      return {
        lotteries: data.lotteries,
        total: data.total,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
*/

export {};
