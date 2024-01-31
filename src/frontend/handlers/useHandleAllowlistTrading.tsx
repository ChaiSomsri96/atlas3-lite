// useHandleAllowlistTrading.ts

import { useMutation } from "react-query";
import { toast } from "react-hot-toast"; // Import toast from react-hot-toast

export type AllowlistTradingType = {
  allowlistTradingEnabled: boolean;
};

export const useHandleAllowlistTrading = () => {
  let toastId = "";
  return useMutation(
    async ({
      projectSlug,
      formData,
    }: {
      projectSlug: string;
      formData: AllowlistTradingType;
    }): Promise<boolean> => {
      toastId = toast.loading("Updating...");
      const request = await fetch(
        `/api/creator/project/${projectSlug}/marketplace/allowlist-trading`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return true;
    },
    {
      // Add onSuccess and onError callbacks
      onSuccess: () => {
        toast.success("Allowlist trading setting updated successfully.", {
          id: toastId,
        });
      },
      onError: (error: Error) => {
        toast.error(`Error updating setting: ${error.message}`, {
          id: toastId,
        });
      },
    }
  );
};
