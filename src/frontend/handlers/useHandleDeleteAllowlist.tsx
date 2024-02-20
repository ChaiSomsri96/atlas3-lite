import { Project } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

export type DeleteAllowlistInput = {
  project: Project;
};

export const useHandleDeleteAllowlist = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ project }: DeleteAllowlistInput): Promise<Project> => {
      const request = await fetch(
        `/api/creator/project/${project.slug}/wallet-collection`,
        {
          method: "DELETE",
          body: JSON.stringify({}),
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

        console.log("Delete Allowlist Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Delete Allowlist Failed", e);
      },
    }
  );
};
