import { useHandleFetchPointTransaction } from "@/frontend/handlers/useHandleFetchPointTransaction";
import { useHandleFetchWithdrawal } from "@/frontend/handlers/useHandleFetchWithdrawal";
import { useHandleWithdrawUserPoints } from "@/frontend/handlers/useHandleWithdrawUserPoints";
import { useUserPendingWithdrawal } from "@/frontend/hooks/useUserPendingWithdrawal";
import { sleep } from "@/frontend/utils";
import { purchasePointsWithMemo } from "@/frontend/utils/purchasePointsWithMemo";
import { PendingWithdrawalResponse } from "@/pages/api/me/marketplace/pending-withdrawal";
import { PendingWithdrawStatusResponseData } from "@/pages/api/me/marketplace/withdraw-status";
import { USDC_MINT, POINTS_VAULT_PUBLIC_KEY } from "@/shared/constants";
import { Dialog, Transition } from "@headlessui/react";
import { TransactionStatus } from "@prisma/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { CloseSquare } from "iconsax-react";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export const ManagePointsModal = ({
  currentPoints,
  isModalOpen,
  setModalOpen,
  refetch,
}: {
  currentPoints: number | undefined;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  refetch: () => void;
}) => {
  const { data: session } = useSession();
  const { register, watch } = useForm();
  const points = watch("points", 1);
  const [pendingWithdrawal, setPendingWithdrawal] =
    useState<PendingWithdrawalResponse>({ success: false, error: "" });
  const handleFetchTransaction = useHandleFetchPointTransaction();
  const handleFetchWithdrawal = useHandleFetchWithdrawal();
  const handleWithdrawUserPoints = useHandleWithdrawUserPoints();
  const { data: pendingWithdrawalData } = useUserPendingWithdrawal();

  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { connection } = useConnection();
  const solanaWallet = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (pendingWithdrawalData) {
      setPendingWithdrawal(pendingWithdrawalData);
    }
  }, [pendingWithdrawalData]);

  const handlePurchase = () => {
    if (solanaWallet && !solanaWallet.publicKey) {
      setVisible(true);
      return;
    }
    purchasePoints(points);
  };

  const handleWithdraw = async () => {
    if (solanaWallet && !solanaWallet.publicKey) {
      setVisible(true);
      return;
    }

    if (!solanaWallet || !solanaWallet.publicKey) {
      return;
    }

    if (solanaWallet) {
      const toastId = toast.loading("Processing withdrawal...");
      setIsWithdrawing(true);
      handleWithdrawUserPoints.mutate(
        {
          walletPublicKey: solanaWallet.publicKey.toBase58(),
        },
        {
          onSuccess: async () => {
            let withdrawal: PendingWithdrawStatusResponseData | undefined;

            for (let i = 0; i < 30; i++) {
              try {
                withdrawal = await handleFetchWithdrawal.mutateAsync();

                if (!withdrawal.processing) {
                  break;
                }
              } catch {}
              await sleep(5 * 1000); // 5 sec
            }

            if (withdrawal && !withdrawal.processing) {
              toast.success("Withdrawal successful!", {
                id: toastId,
                duration: 7000,
              });
              refetch();
              setIsWithdrawing(false);
            } else {
              toast.success(
                "Withdrawal is taking some time, please raise a ticket in Blocksmith Labs if this doesn't arrive in 10 minutes.",
                { id: toastId }
              );
            }
          },
          onError: (error) => {
            toast.error((error as Error).message, { id: toastId });
            setIsWithdrawing(false);
          },
        }
      );
    }
  };

  const purchasePoints = async (points: number) => {
    const toastId = toast.loading("Processing transaction...");

    if (points <= 0) {
      toast.error("Please enter a valid amount.", {
        id: toastId,
      });
      return;
    }

    if (points.toString().includes(".")) {
      toast.error("Please enter a whole number.", {
        id: toastId,
      });
      return;
    }

    try {
      const txSignature = await purchasePointsWithMemo({
        connection,
        wallet: solanaWallet,
        to: POINTS_VAULT_PUBLIC_KEY,
        mint: USDC_MINT,
        points,
        session,
      });

      let transaction = null;
      for (let i = 0; i < 30; i++) {
        try {
          transaction = await handleFetchTransaction.mutateAsync({
            txSignature,
          });

          if (transaction && transaction.status != TransactionStatus.PENDING) {
            break;
          }
        } catch {}
        await sleep(5 * 1000); // 5 sec
      }

      if (transaction && transaction.status == TransactionStatus.SUCCESSED) {
        toast.success("Transaction successful!", {
          id: toastId,
          duration: 7000,
        });
        refetch();
      } else {
        toast.error("Transaction failed.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error((error as Error).message, {
        id: toastId,
      });
    }
  };

  return (
    <div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between items-center">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Manage Points
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <h4 className="block text-md mb-2 dark:text-white font-semibold">
                      You currently have {currentPoints} points.
                    </h4>
                    <div className="mt-4 flex justify-between">
                      {pendingWithdrawal?.success ? (
                        <p className="text-success-500">
                          {pendingWithdrawal?.error
                            ? "Please raise a ticket in the Blocksmith Labs discord to withdraw your points."
                            : "You have a pending withdrawal so keep an eye on your wallet!"}
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={(currentPoints ?? 0) === 0 || isWithdrawing}
                          className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                          onClick={handleWithdraw}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                    <div className="my-4">
                      <h4 className="block text-md mb-2 dark:text-white font-semibold">
                        Purchase Points
                      </h4>
                      <input
                        type="text"
                        placeholder="Ex: 6"
                        className="form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400"
                        {...register("points", {
                          valueAsNumber: true,
                        })}
                        step={1}
                        defaultValue={1}
                      />
                      <div className="mt-2 text-sm flex items-center gap-2">
                        <span className="text-neutral-200">To be paid:</span>
                        <span className="text-white font-semibold">
                          {isNaN(points) ? "-" : points} $USDC
                        </span>
                        <img
                          src="/images/usdc-logo.png"
                          alt="FORGE"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      disabled={!points}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                      onClick={handlePurchase}
                    >
                      Purchase
                    </button>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <WalletMultiButton className="text-center bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500" />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
