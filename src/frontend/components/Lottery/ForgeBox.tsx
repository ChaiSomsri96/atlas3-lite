import { InfoCircle } from "iconsax-react";
import { useState } from "react";
import { ManageForgeModal } from "../Lottery/ManageForgeModal";
import { FaqModal } from "./FaqModal";

type Props = {
  forge: number | undefined;
  refetch: () => void;
  setForge: (forge: number) => void;
};

export const ForgeBox = ({ forge, refetch, setForge }: Props) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isFaqModalOpen, setFaqModalOpen] = useState<boolean>(false);

  return (
    <>
      <div className="bg-primary-900 px-6 py-4  gap-2 rounded-xl mt-14 md:mt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
          <div className="flex items-center order-2 md:order-none">
            <InfoCircle className="w-6 h-6 mr-2" />
            <p className="text-sm text-white max-w-4xl mt-1">
              Stake your $FORGE for a chance to win the lottery and jackpot.
            </p>
          </div>
          <div className="order-1 md:order-2 mb-2 md:mb-0 cursor-pointer flex flex-col">
            <div onClick={() => setModalOpen(true)}>
              <div className="border border-primary-500 rounded-md bg-dark-700 py-1 px-3 flex items-center text-center">
                <img
                  src="/images/icon-forge.png"
                  className="w-5 h-5 mr-2"
                  alt="Points"
                />
                <span className="text-md font-semibold text-white">
                  {((forge ?? 0) / 1000).toLocaleString()} $FORGE
                </span>
                <div
                  className="border-l border-white mx-2 h-4"
                  style={{ borderWidth: "0.5px" }}
                ></div>
                <img src="/images/plusicon.svg" alt="plus" className="h-5 " />
              </div>
            </div>
          </div>
        </div>
        <div
          className="text-sm ml-8 text-white max-w-4xl mt-1 underline cursor-pointer"
          onClick={() => {
            setFaqModalOpen(true);
          }}
        >
          How does it work?
        </div>
      </div>

      <ManageForgeModal
        currentForge={(forge ?? 0) / 1000}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={refetch}
        setForge={setForge}
      />
      <FaqModal isModalOpen={isFaqModalOpen} setModalOpen={setFaqModalOpen} />
    </>
  );
};
