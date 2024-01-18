import { FC, useEffect, useState } from "react";
import SideModal from "./SideModal";
import {
  ExtendedLottery,
  usePreviousLotteries,
} from "@/frontend/hooks/usePreviousLotteries";
import { formatDateShort } from "@/shared/utils";
import SeasonItem from "./SeasonItem";
import { useSession } from "next-auth/react";

const PreviousLotteriesTable: FC = () => {
  const [priseModal, setPrizeModal] = useState(false);

  const [previousLotteries, setPreviousLotteries] =
    useState<ExtendedLottery[]>();
  const [selectedLottery, setSelectedLottery] = useState<ExtendedLottery>();
  const { data: ret } = usePreviousLotteries();
  const { data: session } = useSession();

  useEffect(() => {
    if (ret) {
      setPreviousLotteries(ret.lotteries);
    }
  }, [ret]);

  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[1080px]">
        <thead>
          <tr className="">
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28] rounded-l-xl"
            >
              Season
            </th>
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28]"
            >
              Date
            </th>
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28]"
            >
              Lottery
            </th>
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28]"
            >
              Jackpot
            </th>
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28]"
            >
              Winners
            </th>
            <th
              align="left"
              className="text-[14px] leading-4 py-3 px-4 font-normal bg-[#101D28] rounded-r-xl"
            >
              Won
            </th>
          </tr>
        </thead>
        <tbody>
          {previousLotteries &&
            previousLotteries.map((row, key) => {
              const won = row.winners.find(
                (y) => y.userId === session?.user.id
              );

              console.log(won);

              return (
                <tr
                  key={key}
                  className="relative cursor-pointer"
                  onClick={() => {
                    setSelectedLottery(row);
                    setPrizeModal(true);
                  }}
                >
                  <td className="py-3 border-b border-primary-800">
                    <div className="py-2 px-4 text-[14px] font-semibold text-neutral-50 relative">
                      <span className="relative z-10">
                        {formatDateShort(row.createdAt)}
                      </span>
                      {won && (
                        <div
                          className="absolute left-0 top-0 w-[290px] h-full rounded-lg"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(67, 216, 133, 0.53) 0%, rgba(67, 216, 133, 0.00) 100%)",
                          }}
                        >
                          <div
                            className="w-0.5 h-[18px] bg-[#43D885] rounded-r-lg absolute left-0 top-1/2 -translate-y-1/2"
                            style={{
                              boxShadow:
                                "-4px 0px 35px 11px rgba(7, 115, 55, 0.30), 2px 0px 10px 4px rgba(67, 216, 133, 0.60)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 border-b border-primary-800 relative z-20">
                    <div className="py-2 px-4 text-[14px] font-semibold text-neutral-50">
                      {formatDateShort(row.createdAt)}
                    </div>
                  </td>
                  <td className="py-3 border-b border-primary-800">
                    <div className="py-2 px-4 text-[14px] font-normal text-neutral-50">
                      {row.usdReward}
                    </div>
                  </td>
                  <td className="py-3 border-b border-primary-800">
                    <div className="py-2 px-4 text-[14px] font-normal text-neutral-50">
                      {row.jackpotPrizes[0].name}
                    </div>
                  </td>
                  <td className="py-3 border-b border-primary-800">
                    <div className="py-2 px-4 text-[14px] font-normal text-neutral-50">
                      {row.maxWinners}
                    </div>
                  </td>
                  <td className="py-3 border-b border-primary-800">
                    <div
                      className={`py-2 px-4 text-[14px] font-normal ${
                        won ? "text-success-500" : "text-neutral-50"
                      }`}
                    >
                      {won ? "Yes" : "No"}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <SideModal
        isOpen={priseModal}
        onClose={() => setPrizeModal(false)}
        title="Winners"
      >
        <div className="grid gap-5">
          {selectedLottery &&
            selectedLottery.winners.map((item, key) => (
              <SeasonItem winner={item} key={key} gap={12} />
            ))}
        </div>
      </SideModal>
    </div>
  );
};

export default PreviousLotteriesTable;
