import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { UserPoints } from "@/pages/api/me/marketplace/points";

export const useMarketplacePoints = () => {
  const { data: session } = useSession();
  return useQuery<UserPoints>(
    [PROJECT_KEY, "userPoints"],
    async () => {
      const response = await fetch(`/api/me/marketplace/points`);

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
