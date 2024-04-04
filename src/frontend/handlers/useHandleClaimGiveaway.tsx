import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export const useHandleClaimGiveaway = () => {
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
      toastId = toast.loading("Requesting tokens...");
      const request = await fetch(
        `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/claim`,
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
        await queryClient.invalidateQueries([GIVEAWAY_KEY, "claim"]);
        toast.success(
          "Request successful. Tokens will be airdropped to your withdrawal address shortly.",
          { id: toastId }
        );
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });
      },
    }
  );
};
