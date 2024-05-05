import { MeeListApplications } from "@prisma/client";
import { useQuery } from "react-query";

export type PendingApplicationsResp = {
  applications: MeeListApplications[];
  total: number;
};

export const getPendingApplicationsQueue = async (projectSlug: string) => {
  const url = `/api/creator/project/${projectSlug}/applications/pendingApplicationsQueue`;

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

export const useProjectPendingApplicationsQueue = ({
  projectSlug,
}: {
  projectSlug: string;
}) => {
  return useQuery<PendingApplicationsResp>(
    ["pendingApplications", projectSlug],
    () => getPendingApplicationsQueue(projectSlug)
  );
};
