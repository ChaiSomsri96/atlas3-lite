import Image from "next/image";
import { FC } from "react";
import ToolTip from "./ToolTip";

interface ItemProps {
  isWon?: boolean;
  title: string;
}

const JackpotSymbol: FC<ItemProps> = ({ isWon, title }) => {
  return (
    <ToolTip title={title}>
      <div className={`relative w-6 h-6 xl:w-7 xl:h-7`}>
        {isWon ? (
          <Image
            src="/images/jackpot.svg"
            className="relative"
            fill
            alt=""
            style={{
              filter: isWon
                ? "drop-shadow(0px 0px 24px rgba(30, 144, 255, 0.90)) drop-shadow(0px 1.5px 6px rgba(0, 0, 0, 0.35))"
                : "none",
            }}
          />
        ) : (
          <>
            <Image
              src="/images/jackpot@missed.svg"
              className="relative group-hover:hidden"
              fill
              alt=""
            />
            <Image
              src="/images/jackpot@hover.svg"
              className="relative hidden group-hover:block"
              fill
              alt=""
            />
          </>
        )}
      </div>
    </ToolTip>
  );
};

export default JackpotSymbol;
