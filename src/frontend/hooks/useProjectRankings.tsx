import { AllowlistEntry, ProjectVoteEntry, User } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const RANKING_KEY = "ranking";

export type ProjectRanking = {
  user: User;
  entry?: AllowlistEntry;
} & ProjectVoteEntry;

export type ProjectRankingsResp = {
  rankings: ProjectRanking[];
  total: number;
};

export const getProjectRankings = async (
  projectSlug: string,
  page: number,
  pageLength: number
) => {
  const url = `/api/creator/project/${projectSlug}/rankings/?page=${page}&pageLength=${pageLength}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    rankings: data.rankings,
    total: data.total,
  };
};

export const useProjectRankings = ({
  projectSlug,
  page,
  pageLength,
}: {
  projectSlug: string;
  page: number;
  pageLength: number;
}) => {
  return useQuery<ProjectRankingsResp>(
    [PROJECT_KEY, RANKING_KEY, projectSlug, page, pageLength],
    () => getProjectRankings(projectSlug, page, pageLength)
  );
};
