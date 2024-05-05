import { Project } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type UpcomingProjectsResp = {
  projects: Project[];
  total: number;
};

export const useUpcomingProjects = ({
  upcomingDate,
  sortOption,
  filterOptions,
}: {
  upcomingDate: Date;
  sortOption: string;
  filterOptions: string;
}) => {
  return useQuery<UpcomingProjectsResp>(
    [PROJECT_KEY, "upcomingProjects", upcomingDate, sortOption, filterOptions],
    async () => {
      const response = await fetch(
        `/api/creator/upcoming-projects?upcomingYear=${upcomingDate.getFullYear()}&upcomingMonth=${upcomingDate.getMonth()}&sortOption=${sortOption}&filterOptions=${filterOptions}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all projects");
      }

      const data = await response.json();

      return {
        projects: data.projects,
        total: data.total,
      };
    }
  );
};
