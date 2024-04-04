import { BlockchainNetwork, Giveaway } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export type RaffleInput = {
  id?: string;
  name: string;
  collabProjectId?: string;
  description?: string;
  endsAt: Date | string;
  maxWinners: number;
  giveawayRoleId: string;
  network?: BlockchainNetwork;
  nonAtlas3Project: boolean;
  paymentTokenId: string;
  paymentTokenAmount: number;
  bannerImageUrl?: string;
  discordInviteUrl?: string;
  discordRoleName?: string;
  twitterUsername?: string;
};

export const useHandleCreateRaffle = () => {
  const queryClient = useQueryClient();
  let toastingId = "";
  return useMutation(
    async ({
      id,
      name,
      description,
      endsAt,
      collabProjectId,
      maxWinners,
      giveawayRoleId,
      network,
      paymentTokenId,
      paymentTokenAmount,
      bannerImageUrl,
      discordInviteUrl,
      discordRoleName,
      twitterUsername,
    }: RaffleInput): Promise<Giveaway> => {
      toastingId = toast.loading(`${id ? "Updating" : "Creating"} raffle...`);
      const request = await fetch(`/api/admin/raffles/create-update`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          id,
          name,
          description,
          endsAt,
          maxWinners,
          collabProjectId,
          giveawayRoleId,
          network,
          paymentTokenId,
          paymentTokenAmount,
          bannerImageUrl,
          discordInviteUrl,
          discordRoleName,
          twitterUsername,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const giveaway: Giveaway = data.giveaway;
      return giveaway;
    },
    {
      onSuccess: async (data, variables) => {
        toast.success(`${variables.id ? "Updated" : "Created"} raffle.`, {
          id: toastingId,
        });
        await queryClient.invalidateQueries("adminRaffles");
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });
      },
    }
  );
};
