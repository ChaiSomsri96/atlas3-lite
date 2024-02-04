import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type AllProjectsResp = {
  projects: ExtendedProject[];
  total: number;
};

export const useAllProjects = ({
  page,
  pageLength,
  search,
  sortOption,
  filterOptions,
  notMine,
}: {
  page: number;
  pageLength: number;
  search: string;
  sortOption: string;
  filterOptions: string;
  notMine: boolean;
}) => {
  return useQuery<AllProjectsResp>(
    [
      PROJECT_KEY,
      "allProjects",
      page,
      pageLength,
      search,
      sortOption,
      filterOptions,
      notMine,
    ],
    async () => {
      const response = await fetch(
        `/api/creator/all-projects?page=${page}&pageLength=${pageLength}&search=${search}&sortOption=${sortOption}&filterOptions=${filterOptions}&notMine=${
          notMine ? 1 : 0
        }`
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
