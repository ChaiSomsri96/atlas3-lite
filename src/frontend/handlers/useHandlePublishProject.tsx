import { Project } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

export type ProjectInput = {
  project: Project;
};

export const useHandlePublishProject = () => {
  const queryClient = useQueryClient();
  let toastId = "";
  return useMutation(
    async ({ project }: ProjectInput): Promise<Project> => {
      toastId = toast.loading("Publishing project...");
      const request = await fetch(
        `/api/creator/project/${project.slug}/publish`,
        {
          method: "POST",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const publishedProject: Project = data.project;
      return publishedProject;
    },
    {
      onSuccess: async () => {
        console.log("Create/Update Project Succeded");

        await queryClient.invalidateQueries(PROJECT_KEY);

        toast.success("Project published.", { id: toastId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });

        console.log("Create Project Failed", e);
      },
    }
  );
};
