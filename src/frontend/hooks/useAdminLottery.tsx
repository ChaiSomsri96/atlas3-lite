/*import { useQuery } from "react-query";
import { ExtendedLottery } from "./useRunningLottery";

export const ADMIN_KEY = "lotteries";

export const useAdminLottery = () => {
  return useQuery<ExtendedLottery[]>(
    [ADMIN_KEY, "adminLotteries"],
    async () => {
      const response = await fetch(`/api/admin/lottery`);

      if (!response.ok) {
        throw new Error("Failed to fetch all projects");
      }

      const data = await response.json();
      return data.lotteries;
    }
  );
};
*/

export {};
