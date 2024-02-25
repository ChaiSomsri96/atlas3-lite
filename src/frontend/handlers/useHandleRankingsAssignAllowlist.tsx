import { AllowlistEntry } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

type RankingAllowlistEntry = {
  userId: string;
  projectSlug: string;
};

export const useHandleRankingsAssignAllowlist = () => {
  const queryClient = useQueryClient();
  let toastId = "";

  return useMutation(
    async ({
      userId,
      projectSlug,
    }: RankingAllowlistEntry): Promise<AllowlistEntry> => {
      toastId = toast.loading("Assigning Allowlist...");
      const request = await fetch(
        `/api/creator/project/${projectSlug}/rankings/assign-allowlist`,
        {
          method: "POST",
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const allowlistEntry: AllowlistEntry = data.allowlistEntry;
      return allowlistEntry;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(PROJECT_KEY);
        toast.success("Allowlist Assigned", {
          id: toastId,
        });
      },
      onError: (e: Error) => {
        toast.error(e.message, {
          id: toastId,
        });

        console.log("Wallet submission Failed", e);
      },
    }
  );
};
