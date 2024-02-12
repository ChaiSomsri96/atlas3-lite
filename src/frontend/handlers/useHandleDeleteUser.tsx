import { User } from "@prisma/client";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleDeleteUser = () => {
  return useMutation(
    async (): Promise<User> => {
      const request = await fetch("/api/me/delete-user", {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const deletedAccount: User = data.deletedAccount;

      return deletedAccount;
    },
    {
      onSuccess: async () => {
        console.log("Unlink Succeded");
        toast.success("Deleted User Succesfully, signing out...");
        signOut();
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Unlink Failed", e);
      },
    }
  );
};
