import { Account, PresaleEntry, User } from "@prisma/client";
import { useQuery } from "react-query";
import { PRESALE_KEY } from "./usePresale";

export const GIVEAWAY_KEY = "giveaway";

export type ExtendedPresaleEntry = {
  user: {
    accounts: Account;
  } & User;
} & PresaleEntry;

export type PresaleEntriesResp = {
  entries: ExtendedPresaleEntry[];
  total: number;
};

export const getPresaleEntries = async (
  projectSlug: string,
  presaleSlug: string,
  page: number,
  pageLength: number,
  search: string
) => {
  const url = `/api/creator/project/${projectSlug}/presale/${presaleSlug}/entries?page=${page}&pageLength=${pageLength}&search=${search}`;

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

export const usePresaleEntries = ({
  projectSlug,
  presaleSlug,
  page,
  pageLength,
  search,
}: {
  projectSlug: string;
  presaleSlug: string;
  page: number;
  pageLength: number;
  search: string;
}) => {
  return useQuery<PresaleEntriesResp>(
    [
      PRESALE_KEY,
      "presaleEntries",
      projectSlug,
      presaleSlug,
      page,
      pageLength,
      search,
    ],
    () => getPresaleEntries(projectSlug, presaleSlug, page, pageLength, search)
  );
};
