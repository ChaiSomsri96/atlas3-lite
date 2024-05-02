import { Project, ProjectVoteEntry } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type ExtendedProjectVoteEntry = ProjectVoteEntry & {
  project: Project;
};

export type MyVotesResp = {
  votes: ExtendedProjectVoteEntry[];
};

export const useLeaderboardMyVotes = () => {
  return useQuery<MyVotesResp>(
    [PROJECT_KEY, "leaderboardProjects"],
    async () => {
      const response = await fetch(`/api/project/myVotes`);

      if (!response.ok) {
        throw new Error("Failed to fetch my votes");
      }

      const data = await response.json();

      return data;
    }
  );
};
