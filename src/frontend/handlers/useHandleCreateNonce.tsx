import { toast } from "react-hot-toast";
import { useMutation } from "react-query";

type CreateNonceResponse = {
  nonce: string;
};

export const useHandleCreateNonce = () => {
  return useMutation(
    async ({ address }: { address: string }): Promise<CreateNonceResponse> => {
      const request = await fetch("/api/me/create-nonce", {
        method: "PUT",
        body: JSON.stringify({
          address,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const nonce = data.nonce;

      return {
        nonce,
      };
    },
    {
      onSuccess: async () => {
        console.log("Nonce creation Succeded");
      },
      onError: (e: Error) => {
        toast.error(e.message);
        console.log("Nonce creation Failed", e);
      },
    }
  );
};
