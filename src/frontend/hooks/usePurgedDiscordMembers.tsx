import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { MemberData } from "@/pages/api/creator/project/[projectSlug]/discord-management/members";
import { AllowlistDiscordEntryResponseData } from "@/pages/api/creator/project/[projectSlug]/wallet-collection/allowlist-discord-entries";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { getMembers } from "./useDiscordMembers";
import { PROJECT_KEY } from "./useProject";

export const getPurgedDiscordMembers = async (
  project: ExtendedProject | undefined,
  purgeRole: string | undefined
) => {
  if (!project || !purgeRole) {
    return [];
  }

  if (purgeRole === "Select One")
  {
    return [];
  }

  if (!project.allowlist) {
    throw new Error("No discord allowlist is setup for this project");
  }

  const usersToPurge: MemberData[] = [];
  const discordMembers = await getMembers(project.slug);

  const response = await fetch(
    `/api/creator/project/${project.slug}/wallet-collection/allowlist-discord-entries`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch allowlist entries");
  }

  const data = await response.json();

  const discordUserIds: AllowlistDiscordEntryResponseData = data;

  const allowlistRoles = project.allowlist.roles.map((x) => x.id);

  for (const discordMember of discordMembers) {
    if (
      discordMember.roles.some((x) => allowlistRoles.includes(x)) &&
      !discordUserIds.discordIds.includes(discordMember.user.id) &&
      discordMember.roles.includes(purgeRole)
    ) {
      usersToPurge.push(discordMember);
    }
  }

  return usersToPurge;
};

export const usePurgedUsers = ({
  project,
  purgeRole,
}: {
  project: ExtendedProject | undefined;
  purgeRole: string | undefined;
}) => {
  const { data: session } = useSession();
  return useQuery<MemberData[]>(
    [PROJECT_KEY, "purgedUsers", project?.slug, session?.user.id, purgeRole],
    () => getPurgedDiscordMembers(project, purgeRole),
    {
      enabled: !!session && !!project,
    }
  );
};
