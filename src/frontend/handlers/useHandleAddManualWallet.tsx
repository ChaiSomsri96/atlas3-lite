import { BlockchainNetwork, User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { USER_KEY } from "../hooks/useUserDetails";

type ManualWalletInput = {
  address: string;
  network: BlockchainNetwork;
};

export const useHandleAddManualWallet = () => {
  const queryClient = useQueryClient();
  let toastId: string | undefined = undefined;

  return useMutation(
    async ({ address, network }: ManualWalletInput): Promise<User> => {
      toastId = toast.loading("Adding wallet...");
      const request = await fetch("/api/me/add-manual-wallet", {
        method: "PUT",
        body: JSON.stringify({
          address,
          network,
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

        toast.success("Wallet added successfully", {
          id: toastId,
        });

        console.log("Wallet add Succeded");
      },
      onError: (e: Error) => {
        toast.error(`${e.message}`, {
          id: toastId,
        });

        console.log("Wallet add Failed", e);
      },
    }
  );
};
