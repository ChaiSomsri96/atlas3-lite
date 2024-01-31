import { BulkAddWalletsResponseData } from "@/pages/api/creator/project/[projectSlug]/wallet-collection/bulk-add-wallets";
import { useMutation } from "react-query";

export type BulkAddWalletsInput = {
  wallets: string[];
  multiplier: number;
  roleName: string;
  projectSlug: string;
};

export const useHandleBulkAddWallets = () => {
  return useMutation(
    async ({
      wallets,
      multiplier,
      roleName,
      projectSlug,
    }: BulkAddWalletsInput): Promise<BulkAddWalletsResponseData> => {
      const request = await fetch(
        `/api/creator/project/${projectSlug}/wallet-collection/bulk-add-wallets`,
        {
          method: "PUT",
          body: JSON.stringify({
            wallets,
            multiplier,
            roleName,
            projectSlug,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const response: BulkAddWalletsResponseData = data;
      return response;
    }
  );
};
