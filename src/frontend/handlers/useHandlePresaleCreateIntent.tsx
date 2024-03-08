import { CreatePresaleIntentRequestResponseData } from "@/pages/api/project/[projectSlug]/presale/[presaleSlug]/create-presale-intent";
import { Presale, Project, Wallet } from "@prisma/client";
import { useMutation } from "react-query";

type CreatePresaleEntryIntentInput = {
  presale: Presale & { project: Project };
  wallet: Wallet | undefined;
  amount: number;
};

export const useHandlePresaleCreateIntent = () => {
  return useMutation(
    async ({
      presale,
      wallet,
      amount,
    }: CreatePresaleEntryIntentInput): Promise<CreatePresaleIntentRequestResponseData> => {
      if (!wallet) {
        throw new Error("Wallet is not connected");
      }

      const request = await fetch(
        `/api/project/${presale.project.slug}/presale/${presale.slug}/create-presale-intent`,
        {
          method: "POST",
          body: JSON.stringify({
            walletAddress: wallet?.address,
            entryAmount: amount,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const successData: CreatePresaleIntentRequestResponseData = data;
      return successData;
    },
  );
};
