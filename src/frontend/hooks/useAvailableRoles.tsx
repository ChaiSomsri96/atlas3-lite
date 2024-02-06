import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { DiscordRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const getAvailableRoles = async (projectSlug: string | undefined) => {
  if (!projectSlug) {
    return [];
  }

  const url = `/api/project/${projectSlug}/available-roles`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const roles: DiscordRole[] = data.roles;

  return roles;
};

export const useAvailableRoles = ({
  project,
}: {
  project: ExtendedProject | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<DiscordRole[]>(
    [PROJECT_KEY, "availableRoles", project?.slug, session?.user.id],
    () => getAvailableRoles(project?.slug),
    {
      enabled: !!session && !!project,
    }
  );
};
