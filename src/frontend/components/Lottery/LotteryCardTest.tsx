/*import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getTimeRemaining } from "@/frontend/utils/getTimeRemanining";
import { ExtendedLottery } from "@/frontend/hooks/useRunningLottery";
import { useForgeStaked } from "@/frontend/hooks/useForgeStaked";
import { useHandleEnterLottery } from "@/frontend/handlers/useHandleEnterLottery";
import ToolTip from "../ToolTip";
import { useSession } from "next-auth/react";
import WinnerSlideover from "./WinnerSlideover";

function formatNumber(num: number): string {
  if (Math.abs(num) < 1e3) return num.toString();

  if (Math.abs(num) >= 1e3 && Math.abs(num) < 1e6) {
    return `${(Math.sign(num) * (Math.abs(num) / 1e3)).toFixed(0)}k`;
  }

  if (Math.abs(num) >= 1e6 && Math.abs(num) < 1e9) {
    return `${(Math.sign(num) * (Math.abs(num) / 1e6)).toFixed(0)}M`;
  }

  return num.toString();
}

type Props = {
  lottery: ExtendedLottery;
  refetch: () => void;
};

export default function LotteryCardTest({ lottery, refetch }: Props) {
  const [timeRemanining, setTimeRemaining] = useState(
    getTimeRemaining(lottery.endsAt ? lottery.endsAt : new Date())
  );
  const { data: session } = useSession();

  const { data: userForge, refetch: refetchForge } = useForgeStaked();
  const [forge, setForge] = useState<number>();
  const winner = lottery.entries
    ? lottery.entries.find((x) => x.userId === session?.user.id)
    : undefined;
  const [winnerSlideover, setWinnerSlideover] = useState(false);

  useEffect(() => {
    if (userForge) {
      setForge(userForge.forgeStaked);
    }
  }, [userForge]);

  // counter interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        getTimeRemaining(lottery.endsAt ? lottery.endsAt : new Date())
      );
    }, 1000);

    return () => clearInterval(interval);
  });

  const [ticketAmount, setTicketAmount] = useState(1);
  const totalForgePooled = lottery.totalForgePooled / 1000;
  // const myTotalForgePooled = lottery.entries ? lottery.entries[0].forgeEntered : 0;
  const ticketAmountMinusFee = ticketAmount - ticketAmount * 0.002;

  let chanceOfWinning =
    (ticketAmountMinusFee / (totalForgePooled + ticketAmount)) * 100;
  chanceOfWinning = parseFloat(chanceOfWinning.toFixed(2));

  const handleSetTicketAmount = (amount: string) => {
    const amountNumber = parseInt(amount);
    if (amountNumber <= 100000) {
      setTicketAmount(amountNumber);
    }
  };

  const handleMaxAmount = () => {
    if (forge) {
      setTicketAmount(Math.floor(forge / 1000));
    }
  };

  const handleHalfAmount = () => {
    if (forge) {
      setTicketAmount(Math.floor(forge / 1000 / 2));
    }
  };

  const handleEnterLottery = useHandleEnterLottery();

  const handleEnterGiveaway = () => {
    if (!ticketAmount) {
      toast.error("Please set a ticket amount");
      return;
    }

    if (ticketAmount < 100) {
      toast.error("Minimum stake amount is 100");
      return;
    }

    const toastId = toast.loading("Entering lottery...");

    handleEnterLottery.mutate(
      {
        lottery: lottery,
        forge: ticketAmount,
      },
      {
        onSuccess(isSuccessed) {
          if (isSuccessed.entry) {
            toast.success("Successfully entered lottery!", {
              id: toastId,
            });
            refetch();
            refetchForge();
          } else {
            toast.error("Failed to meet requirements.", {
              id: toastId,
            });
          }
        },
        onError(error) {
          toast.error((error as Error).message, {
            id: toastId,
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4">
      {new Date(lottery.endsAt ?? new Date()) > new Date() ? (
        <div className="text-center mb-4 text-md mt-2">
          Time Remaining: {timeRemanining}
        </div>
      ) : (
        <>
          <div className="text-center text-md mt-2">
            Ended at{" "}
            {new Date(lottery.endsAt ? lottery.endsAt : new Date())
              .toISOString()
              .slice(0, 10)}{" "}
          </div>
        </>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center w-full md:w-1/2 mt-4 mx-auto">
        <div className="flex flex-row items-center space-x-2 md:space-x-4 mb-4 md:mb-0">
          <img
            src="https://rollbit.com/static/media/rakeback.408f0d433557700c02e0.png"
            className="w-20 h-20"
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <p>Lottery</p>
              <ToolTip message="This is the total amount that will be distributed amongst winners each round." />
            </div>
            <div className="text-sm text-neutral-400">${lottery.usdReward}</div>
          </div>
        </div>

        <div className="flex flex-row items-center space-x-2 md:space-x-4">
          <img
            src="https://rollbit.com/static/media/shield-coins.e07d7b7bdd9ab5d742eb.png"
            className="w-20 h-20"
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <p>Jackpot</p>
              <ToolTip message="There is a small chance that one lucky player will win this jackpot each round. If it is not won, it is rolled onto the next lottery." />
            </div>
            <div className="text-sm text-neutral-400">
              {lottery.jackpotReward?.name}
            </div>
          </div>
        </div>
      </div>
      <div className="flex text-sm gap-2 text-white-400 flex-col md:flex-row justify-between mt-10 w-full md:w-1/2 mx-auto">
        <div className="text-center ">
          <p>Winners</p>
          <span className="text-md text-neutral-400">{lottery.maxWinners}</span>
        </div>
        <div className="text-center">
          <p>Total FORGE Staked</p>
          <span className="text-md text-neutral-400">
            {formatNumber(totalForgePooled)}
          </span>
        </div>
        <div className="text-center">
          <p>Your FORGE Staked</p>
          <span className="text-md text-neutral-400">
            {lottery.entries && lottery.entries.length > 0
              ? formatNumber(lottery.entries[0].forgeEntered / 1000)
              : 0}{" "}
          </span>
        </div>
        <div className="text-center">
          <p>Winning Chance</p>
          <span className="text-md text-neutral-400">
            {lottery.entries && lottery.entries.length > 0
              ? (
                  (lottery.entries[0].forgeEntered / lottery.totalForgePooled) *
                  100
                ).toFixed(0)
              : 0}
            %
          </span>
        </div>
      </div>

      {new Date(lottery.endsAt ?? new Date()) > new Date() && (
        <>
          <div className="flex justify-center mt-8">
            <div className="bg-dark-600 w-full md:w-1/2 p-6 justify-center rounded-lg flex flex-col md:flex-row md:space-x-8 mb-4">
              <div>
                <h2 className="text-lg font-bold mb-2">Stake $FORGE</h2>
                <p className="text-sm mb-4">
                  Each staked $FORGE gives you a chance to win
                </p>
                <div className="rounded-md border border-neutral-300 bg-neutral-700 py-1 flex w-full justify-between items-center px-2 mb-2 ">
                  <input
                    onChange={(e) => handleSetTicketAmount(e.target.value)}
                    value={ticketAmount}
                    className=" bg-neutral-700 border-none text-center text-base font-medium shadow-sm focus:outline-none  sm:text-sm w-full"
                    placeholder="0"
                  />
                  <div
                    className="text-md text-black font-semibold bg-white shadow-lg rounded-md w-24 leading-8 text-center mr-2 cursor-pointer"
                    onClick={() => {
                      handleHalfAmount();
                    }}
                  >
                    Half
                  </div>
                  <div
                    className="text-md text-black font-semibold bg-white shadow-lg rounded-md w-24 leading-8 text-center cursor-pointer"
                    onClick={() => {
                      handleMaxAmount();
                    }}
                  >
                    Max
                  </div>
                </div>
                <div className="">
                  <span className="text-sm text-white">
                    Staking fee: {(ticketAmount * 0.002).toFixed(2)} $FORGE
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-white">
                    Current chance of winning: {chanceOfWinning}%
                  </span>
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    disabled={!ticketAmount}
                    className="opacity-100 bg-primary-500 rounded-md shadow-sm py-3 px-4 w-full md:w-1/2 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2"
                    onClick={() => handleEnterGiveaway()}
                  >
                    Stake
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center text-center">
            <p className="text-sm text-orange-500 w-1/2">
              Note that once you have staked your $FORGE for this lottery, you
              cannot increase or decrease that amount.
            </p>
          </div>
        </>
      )}
      {new Date(lottery.endsAt ?? new Date()) < new Date() &&
        !lottery.processed && (
          <div className="text-center mb-4 text-md mt-10">
            Picking winners...
          </div>
        )}

      {new Date(lottery.endsAt ?? new Date()) < new Date() &&
        lottery.processed && (
          <div className="text-center mb-4 text-md mt-10">
            {winner && (
              <div className="text-center mb-2 text-md text-green-500">
                YOU WON!
              </div>
            )}
            <button
              className="opacity-100 bg-primary-500 rounded-md shadow-sm py-3 px-4 w-full md:w-1/2 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2"
              onClick={() => setWinnerSlideover(true)}
            >
              View Winners
            </button>{" "}
          </div>
        )}

      <WinnerSlideover
        winners={lottery.entries}
        open={winnerSlideover}
        setOpen={setWinnerSlideover}
      />
    </div>
  );
}

*/

export {};
