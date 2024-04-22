import { Project } from "@prisma/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

type RemoveTeamInput = {
  project: Project;
};

export const useHandleLeaveTeam = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    async ({ project }: RemoveTeamInput): Promise<Project> => {
      const request = await fetch(
        `/api/creator/project/${project.slug}/team/leave-team`,
        {
          method: "DELETE",
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
        toast.success("You have left the team");

        router.push("/creator/projects");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Remove Manager Failed", e);
      },
    }
  );
};
