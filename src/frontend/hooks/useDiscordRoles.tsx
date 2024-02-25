import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { DiscordRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const getRoles = async (projectSlug: string | undefined) => {
  if (!projectSlug) {
    return [];
  }

  const url = `/api/creator/project/${projectSlug}/wallet-collection/roles`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const roles: DiscordRole[] = data.roles;

  return roles;
};

export const useRoles = ({
  project,
}: {
  project: ExtendedProject | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<DiscordRole[]>(
    [PROJECT_KEY, "discordRoles", project?.slug, session?.user.id],
    () => getRoles(project?.slug),
    {
      enabled: !!session && !!project,
    }
  );
};
