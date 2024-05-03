import { ExtendedAllowlistEntry } from "@/pages/api/creator/project/[projectSlug]/wallet-collection/wallets";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type CollectedWalletsResp = {
  wallets: ExtendedAllowlistEntry[];
  total: number;
};

export const getCollectedWallets = async (
  projectSlug: string,
  page: number,
  pageLength: number
) => {
  const url = `/api/creator/project/${projectSlug}/wallet-collection/wallets?page=${page}&pageLength=${pageLength}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    wallets: data.entries,
    total: data.total,
  };
};

export const useCollectedWallets = ({
  projectSlug,
  page,
  pageLength,
}: {
  projectSlug: string;
  page: number;
  pageLength: number;
}) => {
  return useQuery<CollectedWalletsResp>(
    [PROJECT_KEY, "collectedWallets", projectSlug, page, pageLength],
    () => getCollectedWallets(projectSlug, page, pageLength)
  );
};
