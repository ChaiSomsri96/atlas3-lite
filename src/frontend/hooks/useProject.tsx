import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useQuery } from "react-query";

export const PROJECT_KEY = "project";

export const getProject = async (slug: string) => {
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/project/${slug}`
    : `/api/project/${slug}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const project: ExtendedProject = data.project;

  return project;
};

export const useProject = ({ slug }: { slug: string }) => {
  return useQuery<ExtendedProject>([PROJECT_KEY, "project", slug], () =>
    getProject(slug)
  );
};
