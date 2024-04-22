import { Giveaway, GiveawayStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export const useHandleUpdateGiveawayState = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      projectSlug,
      giveawaySlug,
      status,
      spots,
      preventDuplicateIps,
    }: {
      projectSlug: string;
      giveawaySlug: string;
      status: GiveawayStatus;
      spots: number;
      preventDuplicateIps?: boolean;
    }): Promise<Giveaway> => {
      const request = await fetch(
        `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/update-status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            spots,
            preventDuplicateIps,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resGiveaway: Giveaway = data.giveaway;
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
