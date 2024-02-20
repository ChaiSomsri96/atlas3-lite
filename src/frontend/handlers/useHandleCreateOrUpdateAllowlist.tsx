import { AllowlistType, AllowlistRole, Project } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

export type CreateOrUpdateAllowlistInput = {
  project: Project;
  type?: AllowlistType;
  closesAt?: Date | string | null;
  maxCap?: number | null;
  action?: "create" | "update";
  enabled?: boolean;
  roles?: AllowlistRole[];
};

export const useHandleCreateOrUpdateAllowlist = () => {
  const queryClient = useQueryClient();
  let toastId = "";
  return useMutation(
    async ({
      project,
      type,
      closesAt,
      maxCap,
      action,
      enabled,
      roles,
    }: CreateOrUpdateAllowlistInput): Promise<Project> => {
      toastId = toast.loading(
        action === "create" ? "Creating" : "Updating" + " allowlist..."
      );

      const request = await fetch(
        `/api/creator/project/${project.slug}/wallet-collection`,
        {
          method: action === "create" ? "PUT" : "POST",
          body: JSON.stringify({
            type,
            closesAt,
            maxCap,
            enabled,
            roles,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const responseProject: Project = data.project;
      return responseProject;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(PROJECT_KEY);
        toast.success("Allowlist updated.", { id: toastId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });
        console.log("Create/Update Allowlist Failed", e);
      },
    }
  );
};
