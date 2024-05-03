import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { BlockchainNetwork } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const useTrendyProjects = (network: BlockchainNetwork, all: boolean) => {
  return useQuery<ExtendedProject[] | undefined>(
    [PROJECT_KEY, "trendyProjects", network],
    async () => {
      const response = await fetch(
        `/api/creator/trendy-projects?network=${network}&all=${all}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trendy projects");
      }

      const data = await response.json();
      const trendyProjects: ExtendedProject[] = data.projects;

      return trendyProjects;
    },
    { enabled: true }
  );
};
