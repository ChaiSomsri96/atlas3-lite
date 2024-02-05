import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { useSession } from "next-auth/react";
import { UserForge } from "@/pages/api/me/forge/staked";

export const useForgeStaked = () => {
  const { data: session } = useSession();
  return useQuery<UserForge>(
    [PROJECT_KEY, "userForge"],
    async () => {
      const response = await fetch(`/api/me/forge/staked`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      const data = await response.json();

      return data;
    },
    {
      enabled: !!session,
    }
  );
};
