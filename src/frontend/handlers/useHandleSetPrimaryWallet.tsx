import { BlockchainNetwork, User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { USER_KEY } from "../hooks/useUserDetails";

export const useHandleSetPrimaryWallet = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      address,
      network,
    }: {
      address: string;
      network: BlockchainNetwork;
    }): Promise<User> => {
      const request = await fetch("/api/me/set-primary-wallet", {
        method: "POST",
        body: JSON.stringify({
          address,
          network,
        }),
      });
      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const user: User = data.user;

      return user;
    },
    {
      onSuccess: async () => {
        console.log("Set Primary Wallet Succeded");
        await queryClient.invalidateQueries(USER_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Set Primary Wallet Failed", e);
      },
    }
  );
};
