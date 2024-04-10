import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { ProjectSocials } from "@/shared/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

type RemoveSocialInput = {
  project: ExtendedProject;
  provider: ProjectSocials;
};

export const useHandleDeleteProjectSocial = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      project,
      provider,
    }: RemoveSocialInput): Promise<ExtendedProject> => {
      const request = await fetch("/api/creator/project/socials/remove", {
        method: "DELETE",
        body: JSON.stringify({
          projectId: project.id,
          provider,
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
        console.log("Remove Project Social Succeded");
        await queryClient.invalidateQueries(PROJECT_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Remove Project Social Failed", e);
      },
    }
  );
};
