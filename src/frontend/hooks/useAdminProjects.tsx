import { Project } from "@prisma/client";
import { useQuery } from "react-query";

export const ADMIN_KEY = "projects";

export const useAdminProjects = () => {
  return useQuery<Project[]>([ADMIN_KEY, "adminProjects"], async () => {
    const response = await fetch(`/api/admin/project`);

    if (!response.ok) {
      throw new Error("Failed to fetch all projects");
    }

    const data = await response.json();
    return data.projects;
  });
};
