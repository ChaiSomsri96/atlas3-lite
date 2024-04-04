import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { AllowlistEntry } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

type DeleteSubmissionInput = {
  project: ExtendedProject;
};

export const useHandleDeleteWalletSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ project }: DeleteSubmissionInput): Promise<AllowlistEntry> => {
      const request = await fetch(
        `/api/project/${project.slug}/wallet-collection`,
        {
          method: "DELETE",
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

        console.log("Wallet submission delete Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Wallet submission delete Failed", e);
      },
    }
  );
};
