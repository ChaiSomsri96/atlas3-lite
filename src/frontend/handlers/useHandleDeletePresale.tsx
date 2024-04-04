import { Presale } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export type PresaleInput = {
  projectSlug: string;
  presaleSlug: string;
};

export const useHandleDeletePresale = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ projectSlug, presaleSlug }: PresaleInput): Promise<Presale> => {
      const request = await fetch(
        `/api/creator/project/${projectSlug}/presale/${presaleSlug}/delete`,
        {
          method: "DELETE",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const presale: Presale = data.presale;
      return presale;
    },
    {
      onSuccess: async () => {
        console.log("Delete Presale Succeded");
        await queryClient.invalidateQueries("PRESALE");
        toast.success("Deleted presale!");
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    }
  );
};
