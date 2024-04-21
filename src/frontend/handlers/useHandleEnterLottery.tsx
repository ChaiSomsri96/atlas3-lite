/*import { Lottery } from "@prisma/client";
import { useMutation, useQueryClient } from "react-query";
import { LotteryEntryResponseData } from "@/pages/api/lottery/[id]/enter";

type CreateLotteryEntryInput = {
  lottery: Lottery;
  forge: number;
};

export const useHandleEnterLottery = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      lottery,
      forge,
    }: CreateLotteryEntryInput): Promise<LotteryEntryResponseData> => {
      const request = await fetch(`/api/lottery/${lottery.id}/enter`, {
        method: "PUT",
        body: JSON.stringify({
          forge: forge,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const successData: LotteryEntryResponseData = data;
      return successData;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("lottery");

        console.log("Create Giveaway Entry Succeded");
      },
    }
  );
};
*/

export {};
