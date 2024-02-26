import { Project, User } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

type RemoveManagerInput = {
  user: User;
  project: Project;
};

export const useHandleRemoveManager = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ user, project }: RemoveManagerInput): Promise<Project> => {
      const request = await fetch(
        `/api/creator/project/${project.slug}/team/remove-manager`,
        {
          method: "DELETE",
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const updatedProject: Project = data.project;
      return updatedProject;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(PROJECT_KEY);

        console.log("Remove Manager Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Remove Manager Failed", e);
      },
    }
  );
};
