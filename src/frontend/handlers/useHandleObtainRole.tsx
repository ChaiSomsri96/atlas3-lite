import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { DiscordRole, Wallet } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

export const useHandleObtainRole = (
  setObtaining: (obtaining: boolean) => void
) => {
  const queryClient = useQueryClient();
  let toastId = "";

  return useMutation(
    async ({
      project,
      role,
      wallet,
    }: {
      project: ExtendedProject;
      role: DiscordRole;
      wallet: Wallet | undefined;
    }): Promise<ExtendedProject> => {
      if (!wallet) throw new Error("Select a wallet.");
      toastId = toast.loading("Obtaining role...");
      setObtaining(true);
      const request = await fetch(`/api/project/${project.slug}/obtain-role`, {
        method: "PUT",
        body: JSON.stringify({
          roleId: role.id,
          walletAddress: wallet.address,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const updatedProject: ExtendedProject = data.project;
      return updatedProject;
    },
    {
      onSuccess: async () => {
        toast.success("Role obtained successfully!", { id: toastId });
        setObtaining(false);
        await queryClient.invalidateQueries(PROJECT_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Remove Project Social Failed", e);
      },
    }
  );
};
