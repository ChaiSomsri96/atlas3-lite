import { useQuery } from "react-query";
import { ExtendedGiveaway, GIVEAWAY_KEY } from "./useGiveaway";

export type AllGiveawaysResp = {
  giveaways: ExtendedGiveaway[];
  total: number;
};

export const useAllGiveaways = ({
  page,
  pageLength,
  search,
  sortOption,
  filterOptions,
}: {
  page: number;
  pageLength: number;
  search: string;
  sortOption: string;
  filterOptions: string;
}) => {
  return useQuery<AllGiveawaysResp>(
    [
      GIVEAWAY_KEY,
      "allGiveaways",
      page,
      pageLength,
      search,
      sortOption,
      filterOptions,
    ],
    async () => {
      const response = await fetch(
        `/api/creator/all-giveaways?page=${page}&pageLength=${pageLength}&search=${search}&sortOption=${sortOption}&filterOptions=${filterOptions}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all giveaways");
      }

      const data = await response.json();

      return {
        giveaways: data.giveaways,
        total: data.total,
      };
    }
  );
};
