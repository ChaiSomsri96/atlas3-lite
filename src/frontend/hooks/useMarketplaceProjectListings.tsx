import { MarketplaceProjectListingData } from "@/pages/api/me/marketplace/projects-listings";
import { useQuery } from "react-query";

export type AllProjectListingsResponse = {
  records: MarketplaceProjectListingData[];
  total: number;
};

export const useMarketplaceProjectListings = ({
  page,
  pageLength,
  search,
}: {
  page: number;
  pageLength: number;
  search: string;
}) => {
  return useQuery<AllProjectListingsResponse>(
    ["MP", "marketplaceProjectListings", page, pageLength, search],
    async () => {
      const response = await fetch(
        `/api/me/marketplace/projects-listings?page=${page}&pageLength=${pageLength}&search=${search}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all projects");
      }

      const data = await response.json();

      return {
        records: data.records,
        total: data.total,
      };
    }
  );
};
