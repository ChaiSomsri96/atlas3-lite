import { useHandleDeleteGiveawayEntry } from "@/frontend/handlers/useHandleDeleteGiveawayEntry";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { shortenPublicKey } from "@/shared/utils";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { RxCheck } from "react-icons/rx";

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

export const GiveawayEntryActions = ({
  giveaway,
  isCreatingEntry,
  createGiveawayEntryCallback,
  buyTicketCallback,
  entryCount,
  walletAddress,
}: {
  giveaway: ExtendedGiveaway;
  createGiveawayEntryCallback: () => void;
  isCreatingEntry: boolean;
  buyTicketCallback: () => void;
  entryCount: number;
  walletAddress: string;
}) => {
  const { status } = useSession();
  const userLoading = status === "loading";

  const handleDeleteGiveawayEntry = useHandleDeleteGiveawayEntry();
  const isDeletingEntry = handleDeleteGiveawayEntry.isLoading;
  return (
    <>
      {userLoading ? (
        <EnterButton disabled={true}>Loading...</EnterButton>
      ) : giveaway.paymentToken || !giveaway.paymentToken ? (
        entryCount > 0 ? (
          <div className="flex flex-col items-center text-sm border-t-2 border-gray-400 py-4">
            <p className="flex gap-2 ">
              <RxCheck className="h-6 w-6" />
              <span>
                REGISTERED SUCCESSFULLY - {entryCount} Ticket
                {entryCount > 1 ? "s" : ""}
              </span>
            </p>
            <p>
              {walletAddress === ""
                ? ""
                : `WALLET USED: ${shortenPublicKey(walletAddress)}`}
            </p>

            {giveaway.paymentToken ? (
              <button
                className={`flex justify-center items-center gap-2 py-2 px-4 mt-3 rounded-lg w-full bg-primary-500 text-white transition ${
                  isDeletingEntry && "opacity-20 cursor-default"
                }`}
                onClick={buyTicketCallback}
              >
                Buy Tickets
              </button>
            ) : (
              <button
                className={`flex justify-center items-center gap-2 py-2 px-4 mt-3 rounded-lg w-full border border-primary-500 text-primary-500 transition ${
                  isDeletingEntry && "opacity-20 cursor-default"
                }`}
                onClick={() => {
                  handleDeleteGiveawayEntry.mutate({
                    giveaway,
                  });
                }}
              >
                Cancel Registration
              </button>
            )}
          </div>
        ) : (
          <>
            <EnterButton
              onClick={createGiveawayEntryCallback}
              disabled={isCreatingEntry}
            >
              Enter Giveaway
            </EnterButton>
            {giveaway.paymentToken && (
              <div className="flex justify-center">
                <WalletMultiButton className="mt-4 text-center bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500" />
              </div>
            )}
          </>
        )
      ) : (
        ""
      )}
    </>
  );
};
