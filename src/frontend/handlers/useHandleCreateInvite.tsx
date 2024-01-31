import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { Project, ProjectRoleType } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

type CreateInviteInput = {
  project: Project | ExtendedProject;
  type: ProjectRoleType;
};

export const useHandleCreateInvite = () => {
  let toastId = "";
  return useMutation(
    async ({ project, type }: CreateInviteInput): Promise<string> => {
      toastId = toast.loading("Creating invite...");
      const request = await fetch(
        `/api/creator/project/${project.slug}/team/create-invite`,
        {
          method: "PUT",
          body: JSON.stringify({
            type,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const inviteUrl: string = data.inviteUrl;
      return inviteUrl;
    },
    {
      onSuccess: async () => {
        toast.success("Invite created!", { id: toastId });

        console.log("Create Giveaway Entry Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Create Giveaway Entry Failed", e);
      },
    }
  );
};
