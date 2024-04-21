import { Presale, PresaleStatus } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export const useHandleUpdatePresaleState = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      projectSlug,
      presaleSlug,
      status,
    }: {
      projectSlug: string;
      presaleSlug: string;
      status: PresaleStatus;
    }): Promise<Presale> => {
      const request = await fetch(
        `/api/creator/project/${projectSlug}/presale/${presaleSlug}/update-status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const resPresale: Presale = data.presale;
      return resPresale;
    },
    {
      onSuccess: async () => {
        console.log("Respond Givaway Succeded");
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
      },
      onError: (e: Error) => {
        toast.error(e.message);

        console.log("Respond Givaway Failed", e);
      },
    }
  );
};
