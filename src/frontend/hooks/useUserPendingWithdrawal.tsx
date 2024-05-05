import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { PendingWithdrawalResponse } from "@/pages/api/me/marketplace/pending-withdrawal";

export const useUserPendingWithdrawal = () => {
  const { data: session } = useSession();
  return useQuery<PendingWithdrawalResponse>(
    [PROJECT_KEY, "pendingWithdrawal"],
    async () => {
      const response = await fetch(`/api/me/marketplace/pending-withdrawal`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();

      return data;
    },
    {
      enabled: !!session,
    }
  );
};
