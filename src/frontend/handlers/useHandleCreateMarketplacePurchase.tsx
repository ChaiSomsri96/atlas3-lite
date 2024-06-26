import { MarketplaceRecord } from "@prisma/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useMutation } from "react-query";

export type CreateMarketplacePurchaseInput = {
  projectId: string;
  pointsCost: number;
  tradeType: string;
  roleId: string;
};

export const useHandleCreateMarketplacePurchase = () => {
  const router = useRouter();
  let toastingId = "";

  return useMutation(
    async ({
      projectId,
      pointsCost,
      tradeType,
      roleId,
    }: CreateMarketplacePurchaseInput): Promise<MarketplaceRecord> => {
      toastingId = toast.loading("Saving listing...");

      const request = await fetch(
        "/api/me/marketplace/create-marketplace-record",
        {
          body: JSON.stringify({
            pointsCost,
            projectId,
            tradeType,
            roleId,
          }),
          method: "POST",
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const project: MarketplaceRecord = data.marketplaceRecord;
      return project;
    },
    {
      onSuccess: async () => {
        console.log("Create/Update Project Succeded");

        toast.success("Listing created.", { id: toastingId });
        router.push("/marketplace");
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });
      },
    }
  );
};
