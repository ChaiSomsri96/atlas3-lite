import { FC } from "react";
import JackpotSymbol from "./JackpotSymbol";
import { Lottery } from "@prisma/client";
import { formatDateShort } from "@/shared/utils";

type Props = {
  jackpots: Lottery[];
};

const JackpotHistory: FC<Props> = ({ jackpots }) => {
  return (
    <div className="mt-6">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between">
        <h3 className="text-[16px] tracking-[0.32px] leading-[1] font-medium">
          Jackpot history
        </h3>
        <p className="text-primary-50 opacity-50 text-[14px] mt-1 xl:mt-0">
          See when the jackpot was last hit
        </p>
      </div>
      <div className="flex items-center mt-4 flex-wrap gap-2">
        {Array.from({ length: 100 }).map((_, key) => {
          const jackpot = jackpots[key];
          return (
            <JackpotSymbol
              key={key}
              isWon={jackpot && jackpot.jackpotWon ? jackpot.jackpotWon : false}
              title={
                jackpot && jackpot.createdAt
                  ? `${formatDateShort(jackpot.createdAt)}`
                  : "No data available"
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default JackpotHistory;
