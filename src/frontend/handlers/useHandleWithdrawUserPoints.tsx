import { UserWithdrawPointsRequest } from "@/pages/api/me/marketplace/withdraw-user-points";
import { useMutation } from "react-query";

export type WithdrawRequestInput = {
  walletPublicKey: string;
};

export const useHandleWithdrawUserPoints = () => {
  return useMutation(
    async ({
      walletPublicKey,
    }: WithdrawRequestInput): Promise<UserWithdrawPointsRequest> => {
      const request = await fetch("/api/me/marketplace/withdraw-user-points", {
        body: JSON.stringify({
          walletPublicKey,
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
