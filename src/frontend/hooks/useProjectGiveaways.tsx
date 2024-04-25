import { useQuery } from "react-query";
import { ExtendedGiveaway } from "./useGiveaway";

export const GIVEAWAY_KEY = "giveaway";

export type GiveawaysResp = {
  giveaways: ExtendedGiveaway[];
  total: number;
};

export const getProjectGiveaways = async (
  projectSlug: string,
  projectId: string,
  page: number,
  pageLength: number,
  sortOption: string,
  filterOptions: string,
  search: string
) => {
  const url = `/api/creator/project/${projectSlug}/giveaway?projectId=${projectId}&sortOption=${sortOption}&page=${page}&pageLength=${pageLength}&filterOptions=${filterOptions}&search=${search}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    giveaways: data.giveaways,
    total: data.total,
  };
};

export const useProjectGiveaways = ({
  projectSlug,
  projectId,
  page,
  pageLength,
  sortOption,
  filterOptions,
  search,
}: {
  projectSlug: string;
  projectId: string;
  page: number;
  pageLength: number;
  sortOption: string;
  filterOptions: string;
  search: string;
}) => {
  return useQuery<GiveawaysResp>(
    [
      GIVEAWAY_KEY,
      "giveaway",
      projectSlug,
      projectId,
      page,
      pageLength,
      sortOption,
      filterOptions,
      search,
    ],
    () =>
      getProjectGiveaways(
        projectSlug,
        projectId,
        page,
        pageLength,
        sortOption,
        filterOptions,
        search
      )
  );
};
