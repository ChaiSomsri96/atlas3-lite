import { useHandleFetchTransaction } from "@/frontend/handlers/useHandleFetchTransaction";
import { sleep } from "@/frontend/utils";
import { voteProjectWithMemo } from "@/frontend/utils/voteProjectWithMemo";
import { FORGE_MINT, VAULT_PUBLIC_KEY } from "@/shared/constants";
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

export const VoteModal = ({
  projectId,
  name,
  isOpen,
  refetch,
}: {
  projectId: string;
  name: string;
  isOpen: boolean;
  refetch: () => void;
}) => {
  const { data: session } = useSession();
  const { register, watch, setValue } = useForm();
  const votes = watch("votes", 1);
  const handleFetchTransaction = useHandleFetchTransaction();

  const { connection } = useConnection();
  const solanaWallet = useWallet();
  const { setVisible } = useWalletModal();

  const [isVoteOpen, setVoteOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setValue("votes", 1);
      setVoteOpen(isOpen);
    }
  }, [isOpen]);

  const handleVote = () => {
    if (solanaWallet && !solanaWallet.publicKey) {
      setVisible(true);
      return;
    }
    setVoteOpen(false);
    voteToken(projectId, votes);
  };

  const voteToken = async (projectId: string, votes: number) => {
    const toastId = toast.loading("Processing transaction...");
    try {
      const txSignature = await voteProjectWithMemo({
        connection,
        wallet: solanaWallet,
        to: VAULT_PUBLIC_KEY,
        mint: FORGE_MINT,
        projectId,
        votes,
        session,
      });

      let transaction = null;
      for (let i = 0; i < 30; i++) {
        try {
          transaction = await handleFetchTransaction.mutateAsync({
            txSignature,
          });
          console.log(transaction);

          if (transaction && transaction.status != TransactionStatus.PENDING) {
            break;
          }
        } catch {}
        await sleep(5 * 1000); // 5 sec
      }

      if (transaction && transaction.status == TransactionStatus.SUCCESSED) {
        toast.success("Transaction successful!", {
          id: toastId,
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
      <Transition appear show={isVoteOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setVoteOpen(false)}
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
                      Vote project
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVoteOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-white">
                      You are voting <b>{name}</b>. You can add more than one
                      vote, how many votes do you want to add?
                    </p>

                    <div className="my-4">
                      <h4 className="block text-md mb-2 dark:text-white font-semibold">
                        Number of votes
                      </h4>
                      <input
                        type="text"
                        placeholder="Ex: 6"
                        className="form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400"
                        {...register("votes", {
                          valueAsNumber: true,
                        })}
                        defaultValue={1}
                      />
                      <div className="mt-2 text-sm flex items-center gap-2">
                        <span className="text-neutral-200">To be paid:</span>
                        <span className="text-white font-semibold">
                          {isNaN(votes) ? "-" : votes} $FORGE
                        </span>
                        <img src="/images/icon-forge.png" alt="FORGE" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVoteOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!votes}
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                      onClick={handleVote}
                    >
                      Vote
                    </button>
                  </div>
                  <div className="flex">
                    <WalletMultiButton className="mt-4 text-center bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500" />
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
