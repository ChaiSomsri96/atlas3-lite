import { AllowlistEntry, MarketplaceRecord, Project, User } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type MarketplaceBuyRecordData = {
  createdBy: User;
  project: Project;
  entry: AllowlistEntry | null;
} & MarketplaceRecord;

export type MarketplaceResponseBuyData = {
  records: MarketplaceBuyRecordData[];
};

export const useMarketplaceBuyOrders = () => {
  return useQuery<MarketplaceResponseBuyData>(
    [PROJECT_KEY, "marketplaceBuyOrders"],
    async () => {
      const response = await fetch(`/api/me/marketplace/buy-orders`);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard projects");
      }

      const data = await response.json();

      return {
        records: data.records,
      }
    }
  );
};
