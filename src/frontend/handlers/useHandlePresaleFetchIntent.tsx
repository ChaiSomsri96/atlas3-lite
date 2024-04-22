import { GetPresaleIntentRequestResponseData } from "@/pages/api/project/[projectSlug]/presale/[presaleSlug]/get-presale-intent";
import { Presale, Project } from "@prisma/client";
import { useMutation } from "react-query";
export const TRANSACTION_KEY = "transaction";

type FetchPresaleEntryIntentInput = {
  presale: Presale & { project: Project };
  intentId: string;
};

export const useHandlePresaleFetchIntent = () => {
  return useMutation(
    async ({
      presale,
      intentId,
    }: FetchPresaleEntryIntentInput): Promise<GetPresaleIntentRequestResponseData> => {
      const request = await fetch(
        `/api/project/${presale.project.slug}/presale/${presale.slug}/get-presale-intent`,
        {
          method: "POST",
          body: JSON.stringify({
            intentId: intentId,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const successData: GetPresaleIntentRequestResponseData = data;
      return successData;
    }
  );
};
