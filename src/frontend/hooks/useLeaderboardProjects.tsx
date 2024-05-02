import { Project, ProjectPhase } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type LeaderboardProjectsResp = {
  projects: Project[];
  total: number;
};

export const useLeaderboardProjects = ({ phase }: { phase: ProjectPhase }) => {
  return useQuery<LeaderboardProjectsResp>(
    [PROJECT_KEY, "leaderboardProjects", phase],
    async () => {
      const response = await fetch(`/api/project/leaderboard?phase=${phase}`);

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard projects");
      }

      const data = await response.json();

      return {
        projects: data.projects,
        total: data.total,
      };
    }
  );
};
