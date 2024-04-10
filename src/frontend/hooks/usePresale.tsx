import { Account, PresaleEntry, Project, User, Presale } from "@prisma/client";
import { useQuery } from "react-query";

export const PRESALE_KEY = "presale";

type ExtendedPresaleEntry = {
  user: {
    accounts: Account;
  };
} & PresaleEntry;

export type ExtendedPresale = {
  project: Project;
  entries: ExtendedPresaleEntry[];
  owner: User;
} & Presale;

export const getPresale = async (projectSlug: string, presaleSlug: string) => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/project/${projectSlug}/presale/${presaleSlug}`
    : `/api/project/${projectSlug}/presale/${presaleSlug}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const presale: ExtendedPresale = data.presale;

  return presale;
};

export const usePresale = ({
  projectSlug,
  presaleSlug,
}: {
  projectSlug: string;
  presaleSlug: string;
}) => {
  return useQuery<ExtendedPresale>(
    [PRESALE_KEY, "presale", projectSlug, presaleSlug],
    () => getPresale(projectSlug, presaleSlug)
  );
};
