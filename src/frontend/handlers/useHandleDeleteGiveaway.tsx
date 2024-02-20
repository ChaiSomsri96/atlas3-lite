import { Giveaway } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export type GiveawayInput = {
  projectSlug: string;
  giveawaySlug: string;
};

export const useHandleDeleteGiveaway = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ projectSlug, giveawaySlug }: GiveawayInput): Promise<Giveaway> => {
      const request = await fetch(
        `/api/creator/project/${projectSlug}/giveaway/${giveawaySlug}/delete`,
        {
          method: "DELETE",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const giveaway: Giveaway = data.giveaway;
      return giveaway;
    },
    {
      onSuccess: async () => {
        console.log("Delete Givaway Succeded");
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
        toast.success("Deleted Giveaway!");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Delete Givaway Failed", e);
      },
    }
  );
};
