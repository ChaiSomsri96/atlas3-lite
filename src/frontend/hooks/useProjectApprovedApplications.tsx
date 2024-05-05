import { MeeListApplications } from "@prisma/client";
import { useQuery } from "react-query";

export type PendingApplicationsResp = {
  applications: MeeListApplications[];
  total: number;
};

export const getApprovedApplications = async (projectSlug: string) => {
  const url = `/api/creator/project/${projectSlug}/applications/approvedApplications`;

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

export const useProjectApprovedApplications = ({
  projectSlug,
}: {
  projectSlug: string;
}) => {
  return useQuery<PendingApplicationsResp>(
    ["approvedApplications", projectSlug],
    () => getApprovedApplications(projectSlug)
  );
};
