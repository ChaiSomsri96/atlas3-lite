import { BulkAddRolesResponseData } from "@/pages/api/creator/project/[projectSlug]/discord-management/add-role";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export type BulkAddRolesInput = {
  userIds: string[];
  roleId: string;
  projectSlug: string;
};

export const useHandleBulkAddRoles = () => {
  let loadingId = "";
  return useMutation(
    async ({
      userIds,
      roleId,
      projectSlug,
    }: BulkAddRolesInput): Promise<BulkAddRolesResponseData> => {
      loadingId = toast.loading("Adding roles...");
      for (const userId of userIds) {
        const request = await fetch(
          `/api/creator/project/${projectSlug}/discord-management/add-role`,
          {
            method: "PUT",
            body: JSON.stringify({
              userId,
              roleId,
              projectSlug,
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
        toast.success("Role added.", { id: loadingId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: loadingId });

        console.log("Respond Socials Failed", e);
      },
    }
  );
};
