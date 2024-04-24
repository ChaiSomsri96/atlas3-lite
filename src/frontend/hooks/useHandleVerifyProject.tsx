import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export const useHandleUpdateGiveawayState = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      projectSlug,
      twitterUsername,
    }: {
      projectSlug: string;
      twitterUsername: string;
    }): Promise<{ success: boolean }> => {
      const request = await fetch(`/api/admin/verifyProject`, {
        method: "PUT",
        body: JSON.stringify({
          projectSlug,
          twitterUsername,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resGiveaway: { success: boolean } = data.success;
      return resGiveaway;
    },
    {
      onSuccess: async () => {
        console.log("Respond Givaway Succeded");
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Respond Givaway Failed", e);
      },
    }
  );
};
