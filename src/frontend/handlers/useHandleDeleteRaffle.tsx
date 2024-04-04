import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleDeleteRaffle = () => {
  let toastId = "";
  return useMutation(
    async ({ slug }: { slug: string }): Promise<{ success: boolean }> => {
      toastId = toast.loading(`Deleting raffle...`);
      const request = await fetch(`/api/admin/raffles/${slug}/delete`, {
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
        toast.success(`Deleted raffle.`, {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
};
