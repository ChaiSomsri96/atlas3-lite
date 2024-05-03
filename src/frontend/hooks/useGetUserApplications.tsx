import { ProjectApplicationResponseData } from "@/pages/api/me/applications";
import { useQuery } from "react-query";

export const PRESALE_KEY = "applications";

export const getApplications = async () => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/me/applications`
    : `/api/me/applications`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const applications: ProjectApplicationResponseData = data;

  return applications;
};

export const useGetUserApplications = () => {
  return useQuery<ProjectApplicationResponseData>(
    [PRESALE_KEY, "applications"],
    () => getApplications()
  );
};
