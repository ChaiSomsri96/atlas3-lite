import { Fragment, useEffect, useState } from "react";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import RunningLottery from "@/frontend/components/Lotto/RunningLottery";
import { Tab } from "@headlessui/react";
import PreviousLotteriesTable from "@/frontend/components/Lotto/PreviousLotteriesTable";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FaqModal } from "@/frontend/components/Lottery/FaqModal";

export default function Lottery() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if the user has visited before by looking for the localStorage item
    const hasVisitedBefore = localStorage.getItem("hasVisitedBeforeLossless");

    if (!hasVisitedBefore) {
      // If not, show the modal and set the localStorage item
      setShowModal(true);
      localStorage.setItem("hasVisitedBeforeLossless", "true");
    }
  }, []);

  return (
    <PublicLayout>
      <div>
        <h1 className="text-white md:text-3xl text-[19px] font-bold text-center leading-6 md:leading-10">
          Lossless Lottery
        </h1>
        <p className="text-center text-[12px] md:text-[18px] mt-1 md:mt-3 font-medium leading-[14px] md:leading-[22px]">
          Stake your $FORGE for a chance to win the lottery and jackpot.
        </p>
        <div className="mt-4">
          <Tab.Group>
            <div>
              <div className="flex md:flex-row flex-col gap-4 justify-between items-center">
                <Tab.List className="bg-dark-600 flex justify-between rounded-lg p-1 w-fit">
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                      >
                        Running
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                      >
                        Previous lotteries
                      </button>
                    )}
                  </Tab>
                </Tab.List>
                <div className="flex gap-4 items-center">
                  <div
                    className="rounded-2xl cursor-pointer border border-primary-800 py-3 px-3 items-center bg-primary-900 overflow-hidden relative group"
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    How it works
                  </div>
                  <WalletMultiButton />
                </div>
              </div>
            </div>

            <FaqModal isModalOpen={showModal} setModalOpen={setShowModal} />

            <Tab.Panels>
              <Tab.Panel className="mt-6">
                <RunningLottery />
              </Tab.Panel>
              <Tab.Panel className="mt-6">
                <PreviousLotteriesTable />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </PublicLayout>
  );
}
