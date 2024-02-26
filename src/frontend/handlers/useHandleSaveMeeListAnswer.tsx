import { User } from "@prisma/client";
import { useMutation } from "react-query";

type MeeListInput = {
  answers: { question: string; answer: string }[];
  showLoading: boolean;
};

export const useHandleSaveMeeListAnswer = () => {
  return useMutation(async ({ answers }: MeeListInput): Promise<User> => {
    const request = await fetch("/api/me/meelist/save", {
      method: "PUT",
      body: JSON.stringify({
        answers,
      }),
    });

    const data = await request.json();
    if (!request.ok) {
      console.log("Wallet add Failed", data);

      throw new Error(data.message);
    }

    const user = data.user;
    return user;
  });
};
