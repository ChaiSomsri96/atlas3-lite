/*import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { useClosedLottery } from "@/frontend/hooks/useClosedLottery";
import { ExtendedLottery } from "@/frontend/hooks/useRunningLottery";
import { useForgeStaked } from "@/frontend/hooks/useForgeStaked";
import { ForgeBox } from "./ForgeBox";
import LotteryCardTest from "./LotteryCardTest";

export default function ClosedLottery() {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>();
  const { data: userForge, refetch: refetchForge } = useForgeStaked();

  const [forge, setForge] = useState<number>();

  useEffect(() => {
    if (userForge && userForge.forgeStaked) {
      setForge(userForge.forgeStaked);
    }
  }, [userForge]);

  const { data: ret, isLoading, refetch } = useClosedLottery();

  useEffect(() => {
    if (ret) {
      setLotteries(ret.lotteries);
    }
  }, [ret]);

  return (
    <div>
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
