import { Lottery } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleEndLottery = () => {
  let toastId = "";
  return useMutation(
    async ({ id }: { id: string }): Promise<Lottery> => {
      toastId = toast.loading(`Ending giveaway...`);
      const request = await fetch(`/api/admin/lottery/${id}/end`, {
        method: "POST",
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resGiveaway: Lottery = data.lottery;
      return resGiveaway;
    },
    {
      onSuccess: async () => {
        toast.success(`Ended lottery.`, {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
};
