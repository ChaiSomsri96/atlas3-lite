import { GiveawayEntryResponseData } from "@/pages/api/project/[projectSlug]/giveaway/[giveawaySlug]/enter-giveaway";
import { Giveaway, Project, Wallet } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

type CreateGiveawayEntryInput = {
  giveaway: Giveaway & { project: Project };
  wallet: Wallet | undefined;
};

export const useHandleCreateGiveawayEntry = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      giveaway,
      wallet,
    }: CreateGiveawayEntryInput): Promise<GiveawayEntryResponseData> => {
      if (giveaway.network !== "TBD" && !wallet) {
        throw new Error("Wallet is not connected");
      }

      const request = await fetch(
        `/api/project/${giveaway.project.slug}/giveaway/${giveaway.slug}/enter-giveaway`,
        {
          method: "PUT",
          body: JSON.stringify({
            walletAddress: wallet?.address ?? "",
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const successData: GiveawayEntryResponseData = data;
      return successData;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(GIVEAWAY_KEY);

        console.log("Create Giveaway Entry Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Create Giveaway Entry Failed", e);
      },
    }
  );
};
