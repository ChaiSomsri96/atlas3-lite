import { useMutation } from "react-query";

export const useHandleMasterUnverifyProject = () => {
  return useMutation(
    async ({ projectSlug }: { projectSlug: string }): Promise<boolean> => {
      const request = await fetch(
        `/api/admin/project/${projectSlug}/unverify`,
        {
          method: "PUT",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return true;
    }
  );
};
