import { BulkAddRolesResponseData } from "@/pages/api/creator/project/[projectSlug]/discord-management/add-role";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export type BulkAddRolesInput = {
  userIds: string[];
  projectSlug: string;
  purgeRoleId: string;
};

export const useHandlePurgeDiscordUsers = () => {
  let loadingId = "";
  return useMutation(
    async ({
      userIds,
      projectSlug,
      purgeRoleId,
    }: BulkAddRolesInput): Promise<BulkAddRolesResponseData> => {
      loadingId = toast.loading("Purging users...");

      for (const userId of userIds) {
        const request = await fetch(
          `/api/creator/project/${projectSlug}/discord-management/remove-roles`,
          {
            method: "PUT",
            body: JSON.stringify({
              userId,
              projectSlug,
              purgeRoleId,
            }),
          }
        );

        const data = await request.json();

        if (data.message) {
          throw new Error(data.message);
        }
      }

      return { success: true };
    },
    {
      onSuccess: async () => {
        toast.success("Purged users successfully.", { id: loadingId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: loadingId });
      },
    }
  );
};
