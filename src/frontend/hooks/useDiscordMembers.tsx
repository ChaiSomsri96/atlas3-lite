import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import {
  GuildMembersResponseData,
  MemberData,
} from "@/pages/api/creator/project/[projectSlug]/discord-management/members";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const getMembers = async (projectSlug: string | undefined) => {
  if (!projectSlug) {
    return [];
  }

  let after = "0";
  const allMembers: MemberData[] = [];
  while (true) {
    const response = await fetch(
      `/api/creator/project/${projectSlug}/discord-management/members?after=${after}`
    );
    const data: GuildMembersResponseData = await response.json();

    for (const member of data.members) {
      allMembers.push(member);
    }

    if (data.members.length < 1000) break;

    after = data.members[data.members.length - 1].user.id;
  }

  return allMembers;
};

export const useDiscordMembers = ({
  project,
}: {
  project: ExtendedProject | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<MemberData[]>(
    [PROJECT_KEY, "discordMembers", project?.slug, session?.user.id],
    () => getMembers(project?.slug),
    {
      enabled: !!session && !!project,
    }
  );
};
