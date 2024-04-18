import { PendingWithdrawStatusResponseData } from "@/pages/api/me/marketplace/withdraw-status";
import { useMutation } from "react-query";
export const TRANSACTION_KEY = "transaction";

export const useHandleFetchWithdrawal = () => {
  return useMutation(async (): Promise<PendingWithdrawStatusResponseData> => {
    const request = await fetch(`/api/me/marketplace/withdraw-status`);

    const data = await request.json();
    if (!request.ok) {
      throw new Error(data.message);
    }

    const transaction: PendingWithdrawStatusResponseData = data;
    return transaction;
  });
};
