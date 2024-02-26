import { ProjectStatsData } from "@/pages/api/creator/project/stats";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const useCreatorStats = ({
  projectId,
}: {
  projectId: string | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<ProjectStatsData | undefined>(
    [PROJECT_KEY, "allowlistRules", projectId || ""],
    async () => {
      console.log("Fetching allowlist roles", projectId);

      const requestUrl = `/api/creator/project/stats?projectId=${projectId}`;

      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch allowlist roles");
      }

      const data = await response.json();
      const projectStats = data as ProjectStatsData;

      return projectStats;
    },
    { enabled: !!projectId && !!session }
  );
};
