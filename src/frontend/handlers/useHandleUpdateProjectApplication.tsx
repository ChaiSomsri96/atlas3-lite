import { ApplicationStatus, MeeListApplications } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { APPLICATIONS_KEY } from "../hooks/useProjectPendingApplications";

export const useHandleUpdateProjectApplication = () => {
  const queryClient = useQueryClient();

  let toastId = "";
  let status = "";

  return useMutation(
    async ({
      projectSlug,
      id,
      appStatus,
    }: {
      projectSlug: string;
      id: string;
      appStatus: ApplicationStatus;
    }): Promise<MeeListApplications> => {
      toastId = toast.loading(
        `${appStatus === "APPROVED" ? "Approving" : "Rejecting"} application...`
      );
      status = appStatus;
      const request = await fetch(
        `/api/creator/project/${projectSlug}/applications/${id}/update`,
        {
          method: "PUT",
          body: JSON.stringify({
            status: appStatus,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const app: MeeListApplications = data.application;
      return app;
    },
    {
      onSuccess: async (_, context) => {
        // Invalidate the queries
        console.log(context.projectSlug);
        await queryClient.invalidateQueries([
          APPLICATIONS_KEY,
          context.projectSlug,
        ]);

        toast.success(
          `${status === "APPROVED" ? "Approved" : "Rejected"} application!`,
          { id: toastId }
        );
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Respond Givaway Failed", e);
      },
    }
  );
};
