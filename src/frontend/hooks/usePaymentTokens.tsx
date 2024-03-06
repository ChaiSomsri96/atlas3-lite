import { PaymentToken } from "@prisma/client";
import { useQuery } from "react-query";

export const PROJECT_KEY = "project";

export const getPaymentTokens = async () => {
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/creator/payment-tokens`
    : `/api/creator/payment-tokens`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const paymentTokens: PaymentToken[] = data.paymentTokens;
  return paymentTokens;
};

export const usePaymentTokens = () => {
  return useQuery<PaymentToken[] | undefined>(
    [PROJECT_KEY, "payment-tokens"],
    () => getPaymentTokens()
  );
};
