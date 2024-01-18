import { FC, useMemo, useState } from "react";
import SideModal from "./SideModal";
import SeasonItem from "./SeasonItem";
import { LotteryWinners } from "@prisma/client";
import { formatDate } from "@/shared/utils";
import { PreviousLotteryResp } from "@/frontend/hooks/usePreviousLotteryWinner";
import { useSession } from "next-auth/react";

interface WinnerProps {
  data: PreviousLotteryResp | undefined;
  date: Date;
  winners: LotteryWinners[] | undefined;
  variant: "won" | "fail" | "picking";
}

const WinnerBox: FC<WinnerProps> = ({ data, date, winners, variant }) => {
  const [isMoreModal, setIsMoreModal] = useState(false);
  const { data: session } = useSession();

  const winner = data?.lottery.winners.find(
    (x) => x.userId === session?.user?.id
  );

  const title = useMemo(() => {
    if (variant === "won") {
      return "Congratulations!";
    } else if (variant === "fail") {
      return "Ouch, better luck next time.";
    } else {
      return "Picking winners...";
    }
  }, [variant]);

  const description = useMemo(() => {
    if (variant === "won") {
      return `You won ${winner?.prizeWon.toLocaleString()} on the ${formatDate(
        date
      )} lottery!`;
    } else if (variant === "fail") {
      return `You were not a winner for the ${formatDate(date)} lottery.`;
    } else {
      return "Any changes in your staked FORGE will apply to the next lottery.";
    }
  }, [variant, data]);

  const colors = useMemo(() => {
    if (variant === "won") {
      return {
        border: "#065F46",
        bottom: "#43D885",
        bottomGradient:
          "radial-gradient(50.48% 50.48% at 50% 55.17%, rgba(67, 216, 133, 0.30) 0%, rgba(67, 216, 133, 0.00) 100%)",
        boxShadow:
          "0px -4px 35px 11px rgba(7, 115, 55, 0.30), 0px -2px 10px 4px rgba(67, 216, 133, 0.60)",
      };
    } else if (variant === "fail") {
      return {
        border: "#991B1B",
        bottom: "#FF5B5B",
        bottomGradient:
          "radial-gradient(50.48% 50.48% at 50% 55.17%, rgba(255, 91, 91, 0.30) 0%, rgba(255, 91, 91, 0.00) 100%)",
        boxShadow:
          "0px -4px 35px 11px rgba(160, 28, 28, 0.30), 0px -2px 10px 4px rgba(255, 91, 91, 0.60)",
      };
    } else {
      return {
        border: "#967501",
        bottom: "#FFD336",
        bottomGradient:
          "radial-gradient(50.48% 50.48% at 50% 55.17%, rgba(255, 211, 54, 0.30) 0%, rgba(255, 211, 54, 0.00) 100%)",
        boxShadow:
          "0px -4px 35px 11px rgba(132, 106, 15, 0.30), 0px -2px 10px 4px rgba(255, 211, 54, 0.60)",
      };
    }
  }, [variant]);

  return (
    <div
      className="rounded-2xl border md:py-8 py-6 px-2 md:px-4 overflow-hidden relative"
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
        <div className="">
          <h2 className="text-[20px] md:text-[24px] leading-5 md:leading-6 font-semibold">
            {title}
          </h2>
          {variant === "won" ? (
            <p className="text-[14px] md:text-[16px] text-neutral-50 font-medium mt-2">
              <span className="opacity-50">You won</span>{" "}
              <span>{winner?.prizeWon}</span>{" "}
              <span className="opacity-50">
                on the {formatDate(date)} lottery!
              </span>
            </p>
          ) : (
            <p className="text-[14px] md:text-[16px] text-neutral-50 font-medium mt-2 opacity-50">
              {description}
            </p>
          )}
        </div>
        {variant !== "picking" && (
          <button
            className={`py-3 px-[18px] text-neutral-50 text-[14px] duration-300 font-semibold rounded-xl shadow-btn mt-6 md:mt-0 btn-${variant}`}
            onClick={() => setIsMoreModal(true)}
          >
            See all winners
          </button>
        )}
      </div>
      <div
        className="w-[480px] h-[480px] absolute left-1/2 -translate-x-1/2 -bottom-[281px]"
        style={{
          background: colors.bottomGradient,
        }}
      />
      <div
        className="h-[3px] w-3/4 rounded-t-lg absolute left-1/2 -translate-x-1/2 -bottom-[1px]"
        style={{
          background: colors.bottom,
          boxShadow: colors.boxShadow,
        }}
      />
      <SideModal
        isOpen={isMoreModal}
        onClose={() => setIsMoreModal(false)}
        title="Winners"
      >
        <div className="grid gap-5">
          {winners &&
            winners.length > 0 &&
            winners.map((winner, key) => (
              <SeasonItem winner={winner} key={key} gap={20} />
            ))}
        </div>
      </SideModal>
    </div>
  );
};

export default WinnerBox;
