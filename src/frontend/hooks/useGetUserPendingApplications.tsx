import { ProjectApplicationResponseData } from "@/pages/api/me/applications";
import { useQuery } from "react-query";

export const PRESALE_KEY = "applications";

export const getPendingApplications = async (status: string) => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/me/applications/pending`
    : `/api/me/applications/pending`;

  const response = await fetch(url, {
    body: JSON.stringify({
      status,
    }),
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const applications: ProjectApplicationResponseData = data;

  return applications;
};

export const useGetUserPendingApplications = (status: string) => {
  return useQuery<ProjectApplicationResponseData>(
    [PRESALE_KEY, "applications", status],
    () => getPendingApplications(status)
  );
};
