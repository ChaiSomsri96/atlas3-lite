import { ValidateGiveawayEntryResponseData } from "@/pages/api/project/[projectSlug]/giveaway/[giveawaySlug]/validate-giveway";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

type ValidateGiveawayInput = {
  giveawaySlug: string;
};

export const useHandleValidateEnterRaffle = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      giveawaySlug,
    }: ValidateGiveawayInput): Promise<ValidateGiveawayEntryResponseData> => {
      console.log(giveawaySlug);

      const request = await fetch(`/api/raffles/${giveawaySlug}/validate`);

      console.log(request);

      const data = await request.json();
      if (!request.ok) {
        console.log("Validate raffle", data);

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
