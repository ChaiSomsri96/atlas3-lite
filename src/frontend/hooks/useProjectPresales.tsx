import { useQuery } from "react-query";
import { ExtendedPresale, PRESALE_KEY } from "./usePresale";

export const GIVEAWAY_KEY = "giveaway";

export type PresalesResp = {
  presales: ExtendedPresale[];
  total: number;
  totalEntryCount: number;
  totalRevenue: number;
};

export const getProjectPresales = async (
  projectSlug: string,
  projectId: string,
  page: number,
  pageLength: number,
  sortOption: string,
  filterOptions: string,
  search: string
) => {
  const url = `/api/creator/project/${projectSlug}/presale?projectId=${projectId}&sortOption=${sortOption}&page=${page}&pageLength=${pageLength}&filterOptions=${filterOptions}&search=${search}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    presales: data.presales,
    total: data.total,
    totalEntryCount: data.totalEntryCount,
    totalRevenue: data.totalRevenue,
  };
};

export const useProjectPresales = ({
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
  return useQuery<PresalesResp>(
    [
      PRESALE_KEY,
      "presale",
      projectSlug,
      projectId,
      page,
      pageLength,
      sortOption,
      filterOptions,
      search,
    ],
    () =>
      getProjectPresales(
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
