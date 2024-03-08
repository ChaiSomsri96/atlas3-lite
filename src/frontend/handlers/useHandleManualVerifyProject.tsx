import { useMutation } from "react-query";

export const useHandleManualVerifyProject = () => {
  return useMutation(
    async ({
      projectSlug,
      twitterUsername,
    }: {
      projectSlug: string;
      twitterUsername: string;
    }): Promise<boolean> => {
      const request = await fetch(
        `/api/admin/project/${projectSlug}/manualVerify`,
        {
          method: "PUT",
          body: JSON.stringify({
            twitterUsername,
          }),
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
