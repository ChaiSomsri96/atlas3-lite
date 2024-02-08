import { Account, GiveawayEntry, User } from "@prisma/client";
import { useQuery } from "react-query";

export const GIVEAWAY_KEY = "giveaway";

export type ExtendedGiveawayEntry = {
  user: {
    accounts: Account;
  } & User;
} & GiveawayEntry;

export type GiveawayEntriesResp = {
  entries: ExtendedGiveawayEntry[];
  total: number;
};

export const getGiveawayEntries = async (
  projectSlug: string,
  giveawaySlug: string,
  page: number,
  pageLength: number,
  sortOption: string,
  filterOptions: string,
  search: string
) => {
  const url = `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/entries?sortOption=${sortOption}&page=${page}&pageLength=${pageLength}&filterOptions=${filterOptions}&search=${search}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    entries: data.entries,
    total: data.total,
  };
};

export const useGiveawayEntries = ({
  projectSlug,
  giveawaySlug,
  page,
  pageLength,
  sortOption,
  filterOptions,
  search,
}: {
  projectSlug: string;
  giveawaySlug: string;
  page: number;
  pageLength: number;
  sortOption: string;
  filterOptions: string;
  search: string;
}) => {
  return useQuery<GiveawayEntriesResp>(
    [
      GIVEAWAY_KEY,
      "entries",
      projectSlug,
      giveawaySlug,
      page,
      pageLength,
      sortOption,
      filterOptions,
      search,
    ],
    () =>
      getGiveawayEntries(
        projectSlug,
        giveawaySlug,
        page,
        pageLength,
        sortOption,
        filterOptions,
        search
      )
  );
};
