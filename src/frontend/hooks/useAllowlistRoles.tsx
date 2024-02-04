import { AllowlistRole } from "@prisma/client";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const useAllowlistRoles = ({
  projectId,
  projectSlug,
}: {
  projectId: string | undefined;
  projectSlug: string | undefined;
}) => {
  return useQuery<AllowlistRole[] | undefined>(
    [PROJECT_KEY, "allowlistRules", projectId || "", projectSlug || ""],
    async () => {
      console.log("Fetching allowlist roles", projectId);

      if (!projectId && !projectSlug) return undefined;

      const requestUrl = projectId
        ? `/api/creator/project/allowlist-roles?projectId=${projectId}`
        : `/api/creator/project/allowlist-roles?projectSlug=${projectSlug}`;

      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch allowlist roles");
      }

      const data = await response.json();
      const allowlistRoles: AllowlistRole[] = data.roles;

      return allowlistRoles;
    },
    { enabled: !!projectId || !!projectSlug }
  );
};
