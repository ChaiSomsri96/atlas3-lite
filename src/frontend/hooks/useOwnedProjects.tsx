import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const useOwnedProjects = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<ExtendedProject[] | undefined>(
    [PROJECT_KEY, "ownedProjects", session?.user?.id],
    async () => {
      const response = await fetch("/api/creator/owned-projects");

      if (!response.ok) {
        throw new Error("Failed to fetch owned projects");
      }

      const data = await response.json();
      const ownedProjects: ExtendedProject[] = data.projects;

      return ownedProjects;
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
