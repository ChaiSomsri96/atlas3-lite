/*import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  ExtendedLottery,
  useRunningLottery,
} from "@/frontend/hooks/useRunningLottery";
import { useForgeStaked } from "@/frontend/hooks/useForgeStaked";
import { ForgeBox } from "./ForgeBox";
import LotteryCardTest from "./LotteryCardTest";

export default function RunningLottery() {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>();
  const { data: userForge, refetch: refetchForge } = useForgeStaked();

  const [forge, setForge] = useState<number>();

  useEffect(() => {
    if (userForge && userForge.forgeStaked) {
      setForge(userForge.forgeStaked);
    }
  }, [userForge]);

  const { data: ret, isLoading, refetch } = useRunningLottery();

  useEffect(() => {
    if (ret) {
      setLotteries(ret.lotteries);
    }
  }, [ret]);

  return (
    <div>
      <div className="flex gap-2 items-center justify-end -mt-12">
        {
          <p className="mr-2 text-sm text-gray-400 hidden sm:block">
            <WalletMultiButton className="text-center bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500" />
          </p>
        }
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        lotteries && (
          <div className="w-full">
            <ForgeBox
              forge={forge}
              refetch={refetchForge}
              setForge={setForge}
            />

            <div className="md:flex md:justify-center md:items-center">
              {lotteries?.map((lottery) => (
                <LotteryCardTest
                  key={lottery.id}
                  lottery={lottery}
                  refetch={refetch}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
*/

export {};
