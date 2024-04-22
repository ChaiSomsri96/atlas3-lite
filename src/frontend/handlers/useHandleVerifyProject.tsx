import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { ADMIN_KEY } from "../hooks/useAdminProjects";

export const useHandleVerifyProject = () => {
  const queryClient = useQueryClient();
  let loadingId = "";

  return useMutation(
    async ({
      projectSlug,
      verified,
    }: {
      projectSlug: string;
      verified: boolean;
    }): Promise<boolean> => {
      loadingId = toast.loading("Processing verification...");
      const request = await fetch(`/api/admin/project/${projectSlug}/verify`, {
        method: "PUT",
        body: JSON.stringify({
          verified,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return true;
    },
    {
      onSuccess: async () => {
        toast.success("Success", { id: loadingId });
        await queryClient.invalidateQueries(ADMIN_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: loadingId });
        console.log("Respond Verify Failed", e);
      },
    }
  );
};
