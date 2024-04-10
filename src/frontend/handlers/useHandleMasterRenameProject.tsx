import { useMutation } from "react-query";

export const useHandleMasterRenameProject = () => {
  return useMutation(
    async ({
      oldProjectSlug,
      newProjectSlug,
    }: {
      oldProjectSlug: string;
      newProjectSlug: string;
    }): Promise<boolean> => {
      const request = await fetch(`/api/admin/project/rename`, {
        method: "PUT",
        body: JSON.stringify({
          oldProjectSlug,
          newProjectSlug,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return true;
    }
  );
};
