import { User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { USER_KEY } from "../hooks/useUserDetails";

type StoreOMBInput = {
  wallets: string[];
};

export const useHandleStoreOmb = () => {
  const queryClient = useQueryClient();
  let toastId: string | undefined = undefined;

  return useMutation(
    async ({ wallets }: StoreOMBInput): Promise<User> => {
      toastId = toast.loading("Saving allocation...");
      const request = await fetch("/api/me/storeOmb", {
        method: "PUT",
        body: JSON.stringify({
          wallets,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        console.log("Wallet add Failed", data);

        throw new Error(data.message);
      }

      const user = data.user;
      return user;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(USER_KEY);

        toast.success("Allocation saved successfully", {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(`${e.message}`, {
          id: toastId,
        });
      },
    }
  );
};
