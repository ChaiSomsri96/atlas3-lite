import { useQuery } from "react-query";
import { ExtendedGiveaway } from "./useGiveaway";

export const ADMIN_KEY = "projects";

export const useAdminRaffles = () => {
  return useQuery<ExtendedGiveaway[]>([ADMIN_KEY, "adminRaffles"], async () => {
    const response = await fetch(`/api/admin/raffles`);

    if (!response.ok) {
      throw new Error("Failed to fetch all projects");
    }

    const data = await response.json();
    return data.raffles;
  });
};
