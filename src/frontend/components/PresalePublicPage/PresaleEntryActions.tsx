import { ExtendedPresale } from "@/frontend/hooks/usePresale";
import { shortenPublicKey } from "@/shared/utils";
import { PresaleStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ReactNode, useState } from "react";
import { RxCheck } from "react-icons/rx";
import { Loader } from "../Loader";
import { ManagePointsModal } from "../Marketplace/ManagePointsModal";

const EnterButton = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      className={`flex justify-center items-center gap-2 py-2 px-4 bg-primary-500 rounded-lg text-white w-full transition ${
        disabled ? "opacity-40 hover:cursor-default" : "hover:cursor-pointer"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const PresaleEntryActions = ({
  presale,
  isCreatingEntry,
  createPresaleEntryCallback,
  points,
  refetchPoints,
}: {
  presale: ExtendedPresale;
  createPresaleEntryCallback: () => void;
  refetchPoints: () => void;
  isCreatingEntry: boolean;
  points: number | undefined;
}) => {
  const { status } = useSession();
  const userLoading = status === "loading";
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  if (userLoading) {
    return <Loader />;
  }

  return (
    <>
      {presale.entries.length > 0 && (
        <div className="flex flex-col items-center text-sm border-t-2 border-gray-400 py-4">
          <p className="flex gap-2 ">
            <RxCheck className="h-6 w-6" />
            <span>
              PRESALE ENTERED SUCCESSFULLY - Allocation of{" "}
              {presale.entries[0].entryAmount} NFT
              {presale.entries[0].entryAmount > 1 ? "s" : ""}
            </span>
          </p>
          <p>
            WALLET USED: {shortenPublicKey(presale.entries[0].walletAddress)}
          </p>
        </div>
      )}

      {presale.status === PresaleStatus.RUNNING && (
        <>
          <span className="text-xs text-orange-500">
            Entering in multiple tabs or windows will negatively impact your chances at entering presale. All presale purchases are non-refundable.
          </span>
          <EnterButton
            onClick={() => {
              if (
                !isCreatingEntry &&
                (!presale.entries?.length ||
                  presale.entries[0].entryAmount !== presale.maxSupplyPerUser)
              ) {
                createPresaleEntryCallback();
              }
            }}
            disabled={
              isCreatingEntry ||
              (presale.entries?.length > 0 &&
                presale.entries[0].entryAmount === presale.maxSupplyPerUser)
            }
          >
            Enter Presale
          </EnterButton>
        </>
      )}

      <div
        className="mt-2 order-1 md:order-none mb-2 md:mb-0 cursor-pointer "
        onClick={() => setModalOpen(true)}
      >
        <div className="border border-primary-500 rounded-md bg-dark-700 py-1 px-3 flex items-center text-center justify-center">
          <span className="text-md font-semibold text-white">
            Balance: {(points ?? 0) / 1000}
          </span>
          <img
            src="/images/Atlas3Points.png"
            className="w-5 h-5 ml-1"
            alt="Points"
          />
          <div
            className="border-l border-white mx-2 h-4"
            style={{ borderWidth: "0.5px" }}
          ></div>
          <img src="/images/plusicon.svg" alt="plus" className="h-5 " />{" "}
        </div>
      </div>
      <ManagePointsModal
        currentPoints={(points ?? 0) / 1000}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={refetchPoints}
      />
    </>
  );
};
