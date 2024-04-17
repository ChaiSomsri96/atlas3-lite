import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { MarketplaceActivityData } from "@/pages/api/me/marketplace/activity";

export type MarketplaceActivityResp = {
  records: MarketplaceActivityData[];
  total: number;
};

export const useMarketplaceActivity = ({
  page,
  pageLength,
  search,
}: {
  page: number;
  pageLength: number;
  search: string;
}) => {
  const { data: session } = useSession();

  return useQuery<MarketplaceActivityResp>(
    [PROJECT_KEY, "marketplaceActivity", page, pageLength, search],
    async () => {
      const response = await fetch(
        `/api/me/marketplace/activity?page=${page}&pageLength=${pageLength}&search=${search}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();

      return {
        records: data.records,
        total: data.total,
      };
    },
    {
      enabled: !!session,
    }
  );
};
