import { Project } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type ProjectsForPurchaseResponseData = {
  projects: Project[];
};

export const getAvailableProjectsForPurchase = async () => {
  const url = `/api/me/marketplace/projectsForPurchase`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    projects: data.projects,
  };
};

export const useMarketplaceUserProjectsForPurchase = () => {
  const { data: session } = useSession();
  return useQuery<ProjectsForPurchaseResponseData>(
    [PROJECT_KEY, "availableProjectsForPurchase", session?.user.id],
    () => getAvailableProjectsForPurchase(),
    {
      enabled: !!session,
    }
  );
};
