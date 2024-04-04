import { BlockchainNetwork, Lottery } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export type LotteryInput = {
  id?: string;
  endsAt: Date | string;
  maxWinners: number;
  network?: BlockchainNetwork;
  jackpotName?: string;
  jackpotImageUrl?: string;
  usdReward?: number;
};

export const useHandleCreateLottery = () => {
  const queryClient = useQueryClient();
  let toastingId = "";
  return useMutation(
    async ({
      id,
      endsAt,
      maxWinners,
      network,
      jackpotName,
      jackpotImageUrl,
      usdReward,
    }: LotteryInput): Promise<Lottery> => {
      toastingId = toast.loading(`${id ? "Updating" : "Creating"} lottery...`);
      const request = await fetch(`/api/admin/lottery/create-update`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          id,
          endsAt,
          maxWinners,
          network,
          jackpotName,
          jackpotImageUrl,
          usdReward,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const giveaway: Lottery = data.lottery;
      return giveaway;
    },
    {
      onSuccess: async (data, variables) => {
        toast.success(`${variables.id ? "Updated" : "Created"} lottery.`, {
          id: toastingId,
        });
        await queryClient.invalidateQueries("adminLotteries");
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });
      },
    }
  );
};
