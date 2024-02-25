import { User } from "@prisma/client";
import { useMutation } from "react-query";

type ApplicationInput = {
  answers: { question: string; answer: string }[];
  showLoading: boolean;
  id: string;
};

export const useHandleSaveApplicationAnswer = () => {
  return useMutation(
    async ({ answers, id }: ApplicationInput): Promise<User> => {
      const request = await fetch(`/api/me/applications/${id}/save`, {
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
    }
  );
};
