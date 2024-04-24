import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type AvailableRolesResp = {
  id: string;
  name: string;
  allowlistTradingEnabled: boolean;
  allowlistEnabled: boolean;
};

const getAvailableListingProjects = async () => {
  const url = `/api/me/marketplace/projectsForListing`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const roles: AvailableRolesResp[] = data.projects;

  return roles;
};

export const useMarketplaceUserProjectsForListing = () => {
  const { data: session } = useSession();
  return useQuery<AvailableRolesResp[]>(
    [PROJECT_KEY, "availableListingProjects", session?.user.id],
    () => getAvailableListingProjects(),
    {
      enabled: !!session,
    }
  );
};
