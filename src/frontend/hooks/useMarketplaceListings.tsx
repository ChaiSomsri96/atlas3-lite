import { MarketplaceRecordData } from "@/pages/api/me/marketplace/listings";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";

export type MarketplaceResponseData = {
  records: MarketplaceRecordData[];
  total: number;
  allowlistTradingEnabled: boolean;
};

export const useMarketplaceListings = ({
  activeProjectId,
  page,
  pageLength,
  search,
}: {
  activeProjectId: string;
  page: number;
  pageLength: number;
  search: string;
}) => {
  const { data: session } = useSession();
  return useQuery<MarketplaceResponseData | null>(
    [
      PROJECT_KEY,
      "marketplaceListings",
      activeProjectId,
      page,
      pageLength,
      search,
    ],
    async () => {
      if (activeProjectId === "") {
        return null;
      }

      const response = await fetch(
        `/api/me/marketplace/listings?page=${page}&pageLength=${pageLength}&search=${search}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId: activeProjectId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard projects");
      }

      const data = await response.json();

      return {
        records: data.records,
        total: data.total,
        allowlistTradingEnabled: data.allowlistTradingEnabled,
      };
    },
    {
      enabled: !!session && activeProjectId !== "",
    }
  );
};
