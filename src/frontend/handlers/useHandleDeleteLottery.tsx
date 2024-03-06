import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleDeleteLottery = () => {
  let toastId = "";
  return useMutation(
    async ({ id }: { id: string }): Promise<{ success: boolean }> => {
      toastId = toast.loading(`Deleting raffle...`);
      const request = await fetch(`/api/admin/lottery/${id}/delete`, {
        method: "POST",
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
        toast.success(`Deleted lottery.`, {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
};
