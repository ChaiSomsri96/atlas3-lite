import { Project } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type AllCollabProjectsResp = {
  projects: Project[];
  total: number;
};

export const useCollabProjects = ({
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
  return useQuery<AllCollabProjectsResp>(
    [
      PROJECT_KEY,
      "collabProjects",
      page,
      pageLength,
      search,
      sortOption,
      filterOptions,
      notMine,
    ],
    async () => {
      const response = await fetch(
        `/api/creator/collab-projects?page=${page}&pageLength=${pageLength}&search=${search}&sortOption=${sortOption}&filterOptions=${filterOptions}&notMine=${
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
