import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export type DiscordChannel = {
  id: string;
  name: string;
};

export const getChannels = async (projectSlug: string | undefined) => {
  if (!projectSlug) {
    return [];
  }

  const url = `/api/creator/project/${projectSlug}/socials/channels`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const roles: DiscordChannel[] = data.channels;

  return roles;
};

export const useDiscordChannels = ({
  project,
}: {
  project: ExtendedProject | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<DiscordChannel[]>(
    [PROJECT_KEY, "channels", project?.slug, session?.user.id],
    () => getChannels(project?.slug),
    {
      enabled: !!session && !!project,
    }
  );
};
