import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useQuery } from "react-query";

export const PROJECT_KEY = "project";

export const getFeaturedProjects = async () => {
  const url = `/api/project/featured`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const projects: ExtendedProject[] | null = data.projects;

  return projects;
};

export const useFeaturedProjects = () => {
  return useQuery<ExtendedProject[] | null>(
    [PROJECT_KEY, "featuredProjects"],
    () => getFeaturedProjects()
  );
};
