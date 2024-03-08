import { Giveaway } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleEndRaffle = () => {
  let toastId = "";
  return useMutation(
    async ({ slug }: { slug: string }): Promise<Giveaway> => {
      toastId = toast.loading(`Ending giveaway...`);
      const request = await fetch(`/api/admin/raffles/${slug}/end`, {
        method: "POST",
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resGiveaway: Giveaway = data.giveaway;
      return resGiveaway;
    },
    {
      onSuccess: async () => {
        toast.success(`Ended raffle.`, {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
};
