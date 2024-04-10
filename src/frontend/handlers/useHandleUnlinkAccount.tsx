import { OAuthProvider } from "@/shared/types";
import { Account } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { USER_KEY } from "../hooks/useUserDetails";

export const useHandleUnlinkAccount = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ provider }: { provider: OAuthProvider }): Promise<Account> => {
      const request = await fetch("/api/me/unlink-account", {
        method: "DELETE",
        body: JSON.stringify({
          provider,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const deletedAccount: Account = data.deletedAccount;

      return deletedAccount;
    },
    {
      onSuccess: async () => {
        console.log("Unlink Succeded");
        await queryClient.invalidateQueries(USER_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Unlink Failed", e);
      },
    }
  );
};
