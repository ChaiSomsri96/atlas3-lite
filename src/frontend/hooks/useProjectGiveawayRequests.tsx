import { CollabType } from "@prisma/client";
import { useQuery } from "react-query";
import { ExtendedGiveaway, GIVEAWAY_KEY } from "./useGiveaway";

export type GiveawayRequestsResp = {
  requests: ExtendedGiveaway[];
  total: number;
};

export const getGiveawayRequests = async (
  projectSlug: string,
  collabType: CollabType,
  page: number,
  pageLength: number,
  sortOption: string,
  filterOptions: string,
  search: string
) => {
  const url = `/api/creator/project/${projectSlug}/giveaway/requests?collabType=${collabType}&sortOption=${sortOption}&page=${page}&pageLength=${pageLength}&filterOptions=${filterOptions}&search=${search}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    requests: data.requests,
    total: data.total,
  };
};

export const useProjectGiveawayRequests = ({
  projectSlug,
  collabType,
  page,
  pageLength,
  sortOption,
  filterOptions,
  search,
}: {
  projectSlug: string;
  collabType: CollabType;
  page: number;
  pageLength: number;
  sortOption: string;
  filterOptions: string;
  search: string;
}) => {
  return useQuery<GiveawayRequestsResp>(
    [
      GIVEAWAY_KEY,
      "giveawayRequests",
      projectSlug,
      collabType,
      page,
      pageLength,
      sortOption,
      filterOptions,
      search,
    ],
    () =>
      getGiveawayRequests(
        projectSlug,
        collabType,
        page,
        pageLength,
        sortOption,
        filterOptions,
        search
      )
  );
};
