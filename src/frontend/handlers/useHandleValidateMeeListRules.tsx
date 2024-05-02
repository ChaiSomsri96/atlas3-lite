import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";
import { RuleResult } from "@/backend/giveaway-rules/types";

export type ValidateMeeListResponseData = {
  isSuccess: boolean;
  results: RuleResult[];
};

export const useHandleValidateMeeListRules = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (): Promise<ValidateMeeListResponseData> => {
      const request = await fetch(`/api/me/meelist/validate`);

      const data = await request.json();
      if (!request.ok) {
        console.log("Validate giveaway", data);

        throw new Error(data.message);
      }

      const successData: ValidateMeeListResponseData = data;
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
