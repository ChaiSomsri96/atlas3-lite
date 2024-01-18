import { FC, useEffect, useState } from "react";
import ValueBox from "./ValueBox";
import CountdownTimer from "./CountdownTimer";
import Image from "next/image";
import SeasonItem from "./SeasonItem";
import StakeForge from "./StakeForge";
import JackpotHistory from "./JackpotHistory";
import WinnerBox from "./WinnerBox";
import SideModal from "./SideModal";
import LotteryPrizeLineItem from "./LotteryPrizeLineItem";
import { useRunningLottery } from "@/frontend/hooks/useRunningLottery";
import { Lottery, LotteryWinners, Reward } from "@prisma/client";
import { useTotalStakedForge } from "@/frontend/hooks/useTotalStakedForge";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { usePreviousLotteryWinners } from "@/frontend/hooks/usePreviousLotteryWinners";
import {
  PreviousLotteryResp,
  usePreviousLotteryWinner,
} from "@/frontend/hooks/usePreviousLotteryWinner";
import { usePreviousJackpots } from "@/frontend/hooks/usePreviousJackpots";
import { useSession } from "next-auth/react";

const RunningLottery: FC = () => {
  const [prizeModal, setPrizeModal] = useState(false);
  const [modalPrizes, setModalPrizes] = useState<Reward[]>();
  const [forgeBalance, setForgeBalance] = useState<number>();
  const [refetchForgeBalance, setRefetchForgeBalance] = useState<boolean>();

  const { connection } = useConnection();
  const wallet = useWallet();

  const { data: session } = useSession();

  const [lottery, setLottery] = useState<Lottery>();
  const { data: ret } = useRunningLottery();

  const [totalForgeStaked, setTotalForgeStaked] = useState<number>();
  const { data: forgeStaked, refetch: refetchForgeStaked } =
    useTotalStakedForge();

  const [previousWinners, setPreviousWinners] = useState<LotteryWinners[]>();
  const { data: previousWinnersData } = usePreviousLotteryWinners();

  const [previousLottery, setPreviousLottery] = useState<PreviousLotteryResp>();
  const { data: previousWinnerData } = usePreviousLotteryWinner();

  const [previousJackpots, setPreviousJackpots] = useState<Lottery[]>();
  const { data: previousJackpotData } = usePreviousJackpots();

  useEffect(() => {
    if (ret) {
      setLottery(ret.lottery);
    }
  }, [ret]);

  useEffect(() => {
    if (forgeStaked) {
      setTotalForgeStaked(forgeStaked.totalForgeStaked);
    }
  }, [forgeStaked]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchForgeStaked();
    }, 5000); // 5000ms = 5 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [refetchForgeStaked]);

  useEffect(() => {
    if (previousWinnersData) {
      setPreviousWinners(previousWinnersData.winners);
    }
  }, [previousWinnersData]);

  useEffect(() => {
    if (previousWinnerData) {
      setPreviousLottery(previousWinnerData);
    }
  }, [previousWinnerData]);

  useEffect(() => {
    if (previousJackpotData) {
      setPreviousJackpots(previousJackpotData.jackpots);
    }
  }, [previousJackpotData]);

  useEffect(() => {
    let isMounted = true; // Reference to check if component is still mounted

    const fetchTokenBalance = async () => {
      try {
        if (wallet.publicKey) {
          const publicKey = new PublicKey(wallet.publicKey);
          const tokenAccount = getAssociatedTokenAddressSync(
            new PublicKey("FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds"),
            publicKey
          );
          const tokenBalance = (
            await connection.getTokenAccountBalance(tokenAccount)
          ).value;

          if (isMounted) {
            setForgeBalance(
              tokenBalance.uiAmount ? Math.floor(tokenBalance.uiAmount) : 0
            );
          }
        } else {
          if (isMounted) {
            setForgeBalance(0);
          }
        }
      } catch (ex) {
        console.log(ex);
      }
    };

    fetchTokenBalance();

    return () => {
      isMounted = false; // Set to false when component unmounts or when useEffect re-runs
    };
  }, [wallet, refetchForgeBalance]);

  return (
    <>
      {lottery ? (
        <div className="">
          <div className="grid gap-2 sm:gap-4 lg:gap-[22px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <ValueBox
              title="Lottery Prize"
              value={`$${lottery.usdReward}`}
              isMore={lottery.lotteryPrizes && lottery.lotteryPrizes.length > 0}
              moreHandle={() => {
                setModalPrizes(lottery.lotteryPrizes);
                setPrizeModal(true);
              }}
              tooltipText="Lottery prizes are distributed to stakers at the end of the lottery."
            />
            <ValueBox
              title="Jackpot"
              value={
                lottery.jackpotPrizes
                  ? `${lottery.jackpotPrizes[0].quantity}x ${lottery.jackpotPrizes[0].name}`
                  : "-"
              }
              icon={
                <Image
                  src="/images/jackpot.svg"
                  className="shadow-icon"
                  width={20}
                  height={20}
                  alt=""
                />
              }
              isMore={lottery.jackpotPrizes && lottery.jackpotPrizes.length > 1}
              moreHandle={() => {
                setModalPrizes(lottery.jackpotPrizes);
                setPrizeModal(true);
              }}
              tooltipText="There is a small chance that one lucky staker will take home the jackpot prize. If nobody wins, then it will roll over to the next jackpot."
            />
            <ValueBox
              title="Ends in"
              value={<CountdownTimer targetDate={new Date(lottery.endsAt)} />}
              tooltipText="The time remaining for this lottery."
            />
            <ValueBox
              title="Total $FORGE staked"
              value={new Intl.NumberFormat().format(
                (totalForgeStaked ?? 0) / 1000
              )}
              isHighlight
              icon={
                <Image
                  src="/images/forge.svg"
                  width={20.7}
                  height={24}
                  alt=""
                />
              }
              tooltipText="The total amount of $FORGE staked."
            />
          </div>
          <div className="flex gap-6 mt-6 flex-col lg:flex-row">
            <div className="w-full lg:w-[calc(100%-344px)] xl:w-[calc(100%-424px)]">
              {previousLottery &&
                previousLottery.exists &&
                !lottery.processing && (
                  <>
                    <WinnerBox
                      data={previousLottery}
                      date={lottery.createdAt}
                      winners={previousLottery.lottery.winners}
                      variant={
                        previousLottery.lottery.winners.find(
                          (x) => x.userId === session?.user.id
                        )
                          ? "won"
                          : "fail"
                      }
                    />
                    <div className="h-6" />
                  </>
                )}
              {lottery.processing && (
                <>
                  <WinnerBox
                    data={previousLottery}
                    date={lottery.createdAt}
                    winners={previousWinners}
                    variant={"picking"}
                  />
                  <div className="h-6" />
                </>
              )}
              <StakeForge
                winners={lottery.maxWinners}
                totalForgeStaked={totalForgeStaked ?? 0}
                forgeBalance={forgeBalance ?? 0}
                refetchForgeBalance={setRefetchForgeBalance}
              />

              {previousJackpots && (
                <JackpotHistory jackpots={previousJackpots} />
              )}
            </div>
            <div className="w-full lg:w-[320px] xl:w-[400px]">
              <h2 className="text-[16px] font-semibold leading-[1] -tracking-[0.32px]">
                Previous lottery winners
              </h2>
              <p className="text-[14px] medium leading-[18px] mt-1 text-primary-50 opacity-50"></p>
              <div className="grid gap-3 mt-4">
                {previousWinners &&
                  previousWinners.length > 0 &&
                  previousWinners.map((winner, key) => (
                    <SeasonItem winner={winner} key={key} gap={12} />
                  ))}
              </div>
            </div>
          </div>
          <SideModal
            isOpen={prizeModal}
            onClose={() => setPrizeModal(false)}
            title="Lottery prizes"
          >
            <div className="grid gap-5">
              {modalPrizes &&
                modalPrizes.map((item, key) => (
                  <LotteryPrizeLineItem num={key + 1} item={item} key={key} />
                ))}
            </div>
          </SideModal>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default RunningLottery;
