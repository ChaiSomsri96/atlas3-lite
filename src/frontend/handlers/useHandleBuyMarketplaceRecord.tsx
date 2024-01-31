import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleBuyMarketplaceRecord = () => {
  let toastId = "";
  type Response = {
    success: boolean;
  };

  return useMutation(
    async ({ id }: { id: string }): Promise<Response> => {
      toastId = toast.loading("Purchasing allowlist...");
      const request = await fetch(`/api/me/marketplace/buy-from-listing`, {
        method: "POST",
        body: JSON.stringify({
          id,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resp: Response = data.success;
      return resp;
    },
    {
      onSuccess: async () => {
        toast.success("Purchased allowlist!", { id: toastId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });
      },
    }
  );
};
