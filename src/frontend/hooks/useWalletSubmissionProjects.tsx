import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type WalletSubmissionProjectsResp = {
  projects: ExtendedProject[];
  total: number;
};

export const useWalletSubmissionProjects = ({
  page,
  pageLength,
  sortOption,
  filterOptions,
}: {
  page: number;
  pageLength: number;
  sortOption: string;
  filterOptions: string;
}) => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<WalletSubmissionProjectsResp>(
    [
      PROJECT_KEY,
      "walletSubmissionProjects",
      session?.user?.id,
      page,
      pageLength,
      sortOption,
      filterOptions,
    ],
    async () => {
      const response = await fetch(
        `/api/me/wallet-submission-projects?sortOption=${sortOption}&filterOptions=${filterOptions}&page=${page}&pageLength=${pageLength}`
      );

      if (!response.ok) {
        toast.error(
          "Failed to fetch discord servers, please re-link your discord."
        );
        throw new Error("Failed to fetch owned projects");
      }

      const data = await response.json();

      return {
        projects: data.projects,
        total: data.total,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
