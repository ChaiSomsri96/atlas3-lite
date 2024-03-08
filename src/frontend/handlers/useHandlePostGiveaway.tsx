import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export const useHandlePostGiveaway = () => {
  const queryClient = useQueryClient();
  let toastId = "";
  return useMutation(
    async ({
      projectSlug,
      giveawaySlug,
    }: {
      projectSlug: string;
      giveawaySlug: string;
    }): Promise<boolean> => {
      toastId = toast.loading("Posting giveaway to discord");
      const request = await fetch(
        `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/discord-post`,
        {
          method: "PUT",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const res: boolean = data.success;
      return res;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
        toast.success("Posted giveaway to discord", { id: toastId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });
      },
    }
  );
};
