import { FC } from "react";
import Image from "next/image";
import { LotteryWinners } from "@prisma/client";

interface ItemProps {
  winner: LotteryWinners;
  gap: number;
}

const SeasonItem: FC<ItemProps> = ({ winner, gap = 12 }) => {
  return (
    <div
      className="border-b border-primary-800 flex justify-between items-center last:border-none"
      style={{
        paddingBottom: gap,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
          <Image src={winner.userImage} fill alt="" />
        </div>
        <div className="">
          {/*<span className="text-[12px] font-medium leading-[16px] opacity-50">
            {winner.prizeWon}
    </span>*/}
          <p className="mt-1 text-[18px] font-semibold leading-[1]">
            {winner.username}
          </p>
        </div>
      </div>
      <div
        className={`border rounded-lg relative py-2 px-3 text-[10px] overflow-hidden font-semibold bg-primary-900 ${
          !winner.jackpotWon ? "border-primary-800" : "border-[#DFA44B]"
        }`}
        style={{
          boxShadow: !winner.jackpotWon
            ? "none"
            : "0px 0px 5px 0px rgba(223, 133, 75, 0.30)",
        }}
      >
        <span className="relative z-10">{winner.prizeWon}</span>
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-primary-500 rounded-t-lg w-8 h-[3px] -bottom-[1px]"
          style={{
            boxShadow: !winner.jackpotWon
              ? "0px -4px 35px 11px rgba(30, 144, 255, 0.30), 0px -2px 10px 4px rgba(30, 144, 255, 0.60)"
              : "0px -4px 35px 11px rgba(234, 149, 97, 0.30), 0px -2px 10px 4px rgba(223, 131, 75, 0.60)",
            background: !winner.jackpotWon
              ? "#0085EA"
              : "linear-gradient(270deg, #DFA44B 33.07%, #DF664B 124.91%)",
          }}
        />
      </div>
    </div>
  );
};

export default SeasonItem;
