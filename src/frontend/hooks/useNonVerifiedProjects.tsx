import { Project } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type NonVerifiedProjectsResp = {
  projects: Project[];
};

export const useNonVerifiedProjects = () => {
  return useQuery<NonVerifiedProjectsResp>(
    [PROJECT_KEY, "nonVerifiedProjects"],
    async () => {
      const response = await fetch(`/api/admin/non-verified-projects`);

      if (!response.ok) {
        throw new Error("Failed to fetch all projects");
      }

      const data = await response.json();

      return {
        projects: data.projects,
      };
    }
  );
};
