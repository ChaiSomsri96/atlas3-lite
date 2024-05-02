import { UserWithdrawPointsRequest } from "@/pages/api/me/marketplace/withdraw-user-points";
import { useMutation } from "react-query";

export type WithdrawRequestInput = {
  walletPublicKey: string;
  forge: number;
};

export const useHandleWithdrawUserForge = () => {
  return useMutation(
    async ({
      walletPublicKey,
      forge,
    }: WithdrawRequestInput): Promise<UserWithdrawPointsRequest> => {
      const request = await fetch("/api/me/forge/withdraw-user-forge", {
        body: JSON.stringify({
          walletPublicKey,
          forge,
        }),
        method: "POST",
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      return data;
    }
  );
};
