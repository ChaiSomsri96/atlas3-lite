import { User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export const useHandleSubmitMeeListApplication = () => {
  let toastId: string | undefined = undefined;

  return useMutation(
    async (): Promise<User> => {
      toastId = toast.loading("Submitting application...");
      const request = await fetch("/api/me/meelist/submit", {
        method: "PUT",
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
      onSuccess: () => {
        toast.success("Application submitted successfully", {
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
