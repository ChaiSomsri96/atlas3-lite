import { Giveaway, GiveawayEntry, Project } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

type DeleteGiveawayEntryInput = {
  giveaway: Giveaway & { project: Project };
  userId: string;
};

export const useHandleDeleteGiveawayEntryCreator = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      giveaway,
      userId,
    }: DeleteGiveawayEntryInput): Promise<GiveawayEntry> => {
      const request = await fetch(
        `/api/creator/project/${giveaway.project.slug}/giveaway/${giveaway.slug}/delete-giveaway-entry`,
        {
          method: "DELETE",
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const entry: GiveawayEntry = data.entry;

      return entry;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(GIVEAWAY_KEY);

        console.log("Delete Giveaway Entry Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Delete Giveaway Entry Failed", e);
      },
    }
  );
};
