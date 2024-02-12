import { TransactionRecord } from "@prisma/client";
import { useMutation } from "react-query";
export const TRANSACTION_KEY = "transaction";

export const useHandleFetchPointTransaction = () => {
  return useMutation(
    async ({
      txSignature,
    }: {
      txSignature: string;
    }): Promise<TransactionRecord> => {
      const request = await fetch(`/api/tx/points/${txSignature}`);

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const transaction: TransactionRecord = data.transaction;
      return transaction;
    }
  );
};
