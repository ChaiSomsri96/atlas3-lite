import { FC, ReactNode } from "react";
import { CircleArrow, InfoSmIcon } from "./SvgIcons";
import ToolTip from "./ToolTip";

interface BoxProps {
  title: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  isHighlight?: boolean;
  isMore?: boolean;
  moreHandle?: () => void;
  tooltipText?: string;
}
const ValueBox: FC<BoxProps> = ({
  title,
  value,
  icon,
  isHighlight,
  isMore,
  moreHandle,
  tooltipText,
}) => {
  return (
    <div
      className="rounded-2xl cursor-pointer border border-primary-800 py-4 lg:py-6 flex flex-col items-center justify-center bg-primary-900 overflow-hidden relative group"
      onClick={moreHandle}
    >
      <div className="flex text-[14px] text-neutral opacity-50 relative z-10">
        {title}
        {tooltipText ? (
          <span className="mt-1 ml-1">
            <InfoSmIcon />
          </span>
        ) : (
          <></>
        )}
      </div>
      <ToolTip title={tooltipText}>
        <div className="text-[24px] font-semibold leading-[1] mt-[3px] text-white flex items-center gap-1 relative z-10">
          {icon ? <span>{icon}</span> : <></>}
          {value}
        </div>
      </ToolTip>
      {isMore && moreHandle && (
        <button className="flex gap items-center gap-1 font-medium text-[12px] mt-0.5 z-10">
          + more
          <div
            className="w-3 h-3"
            style={{
              filter:
                "drop-shadow(0px 0px 24px rgba(30, 144, 255, 0.90)) drop-shadow(0px 1.5px 6px rgba(0, 0, 0, 0.35))",
            }}
          >
            <CircleArrow />
          </div>
        </button>
      )}
      <div
        className="w-[240px] h-[240px] absolute left-1/2 -translate-x-1/2 -top-7 pointer-events-none"
        style={{
          background: !isHighlight
            ? "radial-gradient(50.48% 50.48% at 50% 55.17%, rgba(0, 133, 234, 0.30) 0%, rgba(0, 133, 234, 0.00) 100%)"
            : "radial-gradient(50.48% 50.48% at 50% 55.17%, rgba(223, 131, 75, 0.30) 0%, rgba(223, 131, 75, 0.00) 100%)",
        }}
      />
      {!isHighlight ? (
        <div
          className="w-[183px] h-[3px] absolute left-1/2 -translate-x-1/2 bottom-0 bg-primary-500 rounded-t-lg pointer-events-none"
          style={{
            boxShadow:
              "0px -4px 35px 11px rgba(30, 144, 255, 0.30), 0px -2px 10px 4px rgba(30, 144, 255, 0.60)",
          }}
        />
      ) : (
        <div
          className="w-[183px] h-[3px] absolute left-1/2 -translate-x-1/2 bottom-0 rounded-t-lg pointer-events-none"
          style={{
            background:
              "linear-gradient(270deg, #DFA44B 33.07%, #DF664B 124.91%)",
            boxShadow:
              "0px -4px 35px 11px rgba(234, 149, 97, 0.30), 0px -2px 10px 4px rgba(223, 131, 75, 0.60)",
          }}
        />
      )}
    </div>
  );
};

export default ValueBox;
