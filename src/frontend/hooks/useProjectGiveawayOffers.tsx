import { CollabType } from "@prisma/client";
import { useQuery } from "react-query";
import { ExtendedGiveaway, GIVEAWAY_KEY } from "./useGiveaway";

export type GiveawayOffersResp = {
  offers: ExtendedGiveaway[];
  total: number;
};

export const getGiveawayOffers = async (
  projectSlug: string,
  collabType: CollabType,
  page: number,
  pageLength: number,
  filterOptions: string,
  search: string,
  sortOption: string
) => {
  const url = `/api/creator/project/${projectSlug}/giveaway/offers?collabType=${collabType}&page=${page}&pageLength=${pageLength}&filterOptions=${filterOptions}&search=${search}&sortOption=${sortOption}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    offers: data.offers,
    total: data.total,
  };
};

export const useProjectGiveawayOffers = ({
  projectSlug,
  collabType,
  page,
  pageLength,
  filterOptions,
  search,
  sortOption,
}: {
  projectSlug: string;
  collabType: CollabType;
  page: number;
  pageLength: number;
  filterOptions: string;
  search: string;
  sortOption: string;
}) => {
  return useQuery<GiveawayOffersResp>(
    [
      GIVEAWAY_KEY,
      "giveawayOffers",
      projectSlug,
      collabType,
      page,
      pageLength,
      filterOptions,
      search,
      sortOption,
    ],
    () =>
      getGiveawayOffers(
        projectSlug,
        collabType,
        page,
        pageLength,
        filterOptions,
        search,
        sortOption
      )
  );
};
