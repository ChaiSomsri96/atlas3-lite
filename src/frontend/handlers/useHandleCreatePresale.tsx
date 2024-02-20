import { Presale, GiveawayRule } from "@prisma/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export type PresaleInput = {
  id?: string;
  name: string;
  projectSlug: string;
  projectId: string;
  endsAt: Date | string;
  supply: number;
  rules: Partial<GiveawayRule>[];
  maxSupplyPerUser: number;
  pointsCost: number;
};

export const useHandleCreatePresale = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  let toastingId = "";
  return useMutation(
    async ({
      id,
      name,
      projectSlug,
      projectId,
      endsAt,
      supply,
      rules,
      maxSupplyPerUser,
      pointsCost,
    }: PresaleInput): Promise<Presale> => {
      toastingId = toast.loading(`${id ? "Updating" : "Creating"} presale...`);
      const request = await fetch(
        `/api/creator/project/${projectSlug}/presale/create-update`,
        {
          method: id ? "POST" : "PUT",
          body: JSON.stringify({
            id,
            name,
            projectSlug,
            projectId,
            endsAt,
            supply,
            rules,
            maxSupplyPerUser,
            pointsCost,
          }),
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
      onSuccess: async (data, variables) => {
        toast.success(`${variables.id ? "Updated" : "Created"} presale.`, {
          id: toastingId,
        });
        await queryClient.invalidateQueries("PRESALE");
        if (router.asPath.includes("/creator/")) {
          router.push(`/creator/project/${variables.projectSlug}/presales`);
        }
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });

        console.log("Create Givaway Failed", e);
      },
    }
  );
};
