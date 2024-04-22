import { ValidateGiveawayEntryResponseData } from "@/pages/api/project/[projectSlug]/giveaway/[giveawaySlug]/validate-giveway";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

type ValidateGiveawayInput = {
  projectSlug: string;
  giveawaySlug: string;
};

export const useHandleValidateEnterGiveaway = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      projectSlug,
      giveawaySlug,
    }: ValidateGiveawayInput): Promise<ValidateGiveawayEntryResponseData> => {
      const request = await fetch(
        `/api/project/${projectSlug}/giveaway/${giveawaySlug}/validate-giveway`
      );

      const data = await request.json();
      if (!request.ok) {
        console.log("Validate giveaway", data);

        throw new Error(data.message);
      }

      const successData: ValidateGiveawayEntryResponseData = data;
      return successData;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
        console.log("Validate giveaway Succeded");
      },
      onError: (e: Error) => {
        console.log("Validate giveaway Failed", e);
      },
    }
  );
};
