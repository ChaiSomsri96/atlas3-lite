import { BlockchainNetwork, User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { USER_KEY } from "../hooks/useUserDetails";

export const useHandleDeleteWallet = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      address,
      network,
    }: {
      address: string;
      network: BlockchainNetwork;
    }): Promise<User> => {
      const request = await fetch("/api/me/delete-wallet", {
        method: "DELETE",
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
        console.log("Delete Wallet Succeded");
        await queryClient.invalidateQueries(USER_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);
        console.log("Delele Wallet Failed", e);
      },
    }
  );
};
