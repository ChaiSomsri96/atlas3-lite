import { ProjectApplicationSubmissions } from "@prisma/client";
import { useQuery } from "react-query";

export type PendingApplicationsResp = {
  applications: ProjectApplicationSubmissions[];
  total: number;
};

export const APPLICATIONS_KEY = "applications";

export const getPendingApplications = async (
  projectSlug: string,
  page: number,
  pageLength: number,
  search: string,
  sortOption: string
) => {
  const url = `/api/creator/project/${projectSlug}/applications/pendingApplications?page=${page}&pageLength=${pageLength}&search=${search}&sortOption=${sortOption}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return {
    applications: data.applications,
    total: data.total,
  };
};

export const useProjectPendingApplications = ({
  projectSlug,
  page,
  pageLength,
  search,
  sortOption,
}: {
  projectSlug: string;
  page: number;
  pageLength: number;
  search: string;
  sortOption: string;
}) => {
  return useQuery<PendingApplicationsResp>(
    [APPLICATIONS_KEY, projectSlug, page, pageLength, search, sortOption],
    () =>
      getPendingApplications(projectSlug, page, pageLength, search, sortOption)
  );
};
