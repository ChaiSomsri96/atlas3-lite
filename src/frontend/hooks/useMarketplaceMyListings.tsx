import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { MarketplaceMyListingResponseData } from "@/pages/api/me/marketplace/my-listings";

export const useMarketplaceMyListings = () => {
  const { data: session } = useSession();
  return useQuery<MarketplaceMyListingResponseData>(
    [PROJECT_KEY, "marketplaceActivity"],
    async () => {
      const response = await fetch(`/api/me/marketplace/my-listings`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();

      return {
        records: data.records,
      };
    },
    {
      enabled: !!session,
    }
  );
};
