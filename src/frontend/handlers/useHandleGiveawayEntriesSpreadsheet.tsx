import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { ADMIN_KEY } from "../hooks/useAdminProjects";

export const useHandleGiveawayEntriesSpreadsheet = () => {
  const queryClient = useQueryClient();
  let loadingId = "";
  let data: { data: string; message: string };
  return useMutation(
    async ({
      projectSlug,
      giveawaySlug,
    }: {
      projectSlug: string;
      giveawaySlug: string;
    }): Promise<boolean> => {
      loadingId = toast.loading("Getting winners..");

      const url = `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/copy-entries-clipboard`;

      const response = await fetch(url);

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return true;
    },
    {
      onSuccess: async () => {
        navigator.clipboard.writeText(data.data);
        toast.success("Copied to clipboard", { id: loadingId });
        await queryClient.invalidateQueries(ADMIN_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: loadingId });
        console.log("Respond Verify Failed", e);
      },
    }
  );
};
