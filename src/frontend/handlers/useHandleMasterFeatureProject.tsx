import { useMutation } from "react-query";

export const useHandleMasterFeatureProject = () => {
  return useMutation(
    async ({
      projectSlug,
      featured,
    }: {
      projectSlug: string;
      featured: boolean;
    }): Promise<boolean> => {
      const request = await fetch(`/api/admin/project/${projectSlug}/feature`, {
        method: "PUT",
        body: JSON.stringify({
          featured,
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
