import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { MarketplaceProjectActivityData } from "@/pages/api/creator/project/[projectSlug]/marketplace/activity";

export const useMarketplaceProjectActivity = ({
  projectSlug,
}: {
  projectSlug: string;
}) => {
  const { data: session } = useSession();
  return useQuery<MarketplaceProjectActivityData[]>(
    [PROJECT_KEY, "marketplaceActivity"],
    async () => {
      const response = await fetch(
        `/api/creator/project/${projectSlug}/marketplace/activity`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();

      return data.records;
    },
    {
      enabled: !!session,
    }
  );
};
