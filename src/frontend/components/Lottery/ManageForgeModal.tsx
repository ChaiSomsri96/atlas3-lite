import { useHandleFetchForgeTransaction } from "@/frontend/handlers/useHandleFetchForgeTransaction";
import { useHandleFetchForgeWithdrawal } from "@/frontend/handlers/useHandleFetchForgeWithdrawal";
import { useHandleWithdrawUserForge } from "@/frontend/handlers/useHandleWithdrawUserForge";
import { useUserPendingWithdrawal } from "@/frontend/hooks/useUserPendingWithdrawal";
import { sleep } from "@/frontend/utils";
import { stakeForgeWithMemo } from "@/frontend/utils/stakeForgeWithMemo";
import { PendingWithdrawalResponse } from "@/pages/api/me/marketplace/pending-withdrawal";
import { PendingWithdrawStatusResponseData } from "@/pages/api/me/marketplace/withdraw-status";
import { VAULT_PUBLIC_KEY_FORGE_STAKED, FORGE_MINT } from "@/shared/constants";
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

export const ManageForgeModal = ({
  currentForge,
  isModalOpen,
  setModalOpen,
  refetch,
  setForge,
}: {
  currentForge: number | undefined;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  refetch: () => void;
  setForge: (forge: number) => void;
}) => {
  const { data: session } = useSession();
  const { register, watch } = useForm();
  const forge = watch("forge", 1);
  const [pendingWithdrawal, setPendingWithdrawal] =
    useState<PendingWithdrawalResponse>({ success: false, error: "" });
  const handleFetchTransaction = useHandleFetchForgeTransaction();
  const handleFetchWithdrawal = useHandleFetchForgeWithdrawal();
  const handleWithdrawUserForge = useHandleWithdrawUserForge();
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
    purchaseForge(forge);
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
      handleWithdrawUserForge.mutate(
        {
          walletPublicKey: solanaWallet.publicKey.toBase58(),
          forge: forge,
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
              setForge(0);
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

  const purchaseForge = async (forge: number) => {
    const toastId = toast.loading("Processing transaction...");

    if (forge <= 0) {
      toast.error("Please enter a valid amount.", {
        id: toastId,
      });
      return;
    }

    if (forge.toString().includes(".")) {
      toast.error("Please enter a whole number.", {
        id: toastId,
      });
      return;
    }

    try {
      const txSignature = await stakeForgeWithMemo({
        connection,
        wallet: solanaWallet,
        to: VAULT_PUBLIC_KEY_FORGE_STAKED,
        mint: FORGE_MINT,
        forge,
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
                      Manage FORGE
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
                      You currently have {currentForge} FORGE.
                    </h4>
                    <div className="mt-4 flex justify-between">
                      {pendingWithdrawal?.success ? (
                        <p className="text-success-500">
                          {pendingWithdrawal?.error
                            ? "Please raise a ticket in the Blocksmith Labs discord to withdraw your FORGE."
                            : "You have a pending withdrawal so keep an eye on your wallet!"}
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={(currentForge ?? 0) === 0 || isWithdrawing}
                          className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                          onClick={handleWithdraw}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                    <div className="my-4">
                      <h4 className="block text-md mb-2 dark:text-white font-semibold">
                        Deposit FORGE
                      </h4>
                      <input
                        type="text"
                        placeholder="Ex: 6"
                        className="form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400"
                        {...register("forge", {
                          valueAsNumber: true,
                        })}
                        step={1}
                        defaultValue={1}
                      />
                      <div className="mt-2 text-sm flex items-center gap-2">
                        <span className="text-neutral-200">
                          To be deposited:
                        </span>
                        <span className="text-white font-semibold">
                          {isNaN(forge) ? "-" : forge} $FORGE
                        </span>
                        <img
                          src="/images/icon-forge.png"
                          alt="FORGE"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      disabled={!forge}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                      onClick={handlePurchase}
                    >
                      Deposit
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
