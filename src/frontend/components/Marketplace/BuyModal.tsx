import { useHandleBuyMarketplaceRecord } from "@/frontend/handlers/useHandleBuyMarketplaceRecord";
import { Dialog, Transition } from "@headlessui/react";
import { CloseSquare } from "iconsax-react";
import { Fragment } from "react";

type BuyModalProps = {
  recordId: string | undefined;
  recordName: string | undefined;
  recordPointCost: number | undefined;
  roleName: string | undefined;
  discordInvite: string | undefined;
  isOpen: boolean;
  setBuyOpen: (isOpen: boolean) => void;
  refetch: () => void;
  myPoints: number | undefined;
};

export const BuyModal = ({
  recordId,
  recordName,
  recordPointCost,
  roleName,
  discordInvite,
  isOpen,
  setBuyOpen,
  refetch,
  myPoints,
}: BuyModalProps) => {
  const handleBuyMarketplaceRecord = useHandleBuyMarketplaceRecord();

  const buy = async () => {
    if (!recordId) return;

    handleBuyMarketplaceRecord.mutateAsync(
      {
        id: recordId,
      },
      {
        onSuccess: async () => {
          setBuyOpen(false);
          refetch();
        },
      }
    );
  };

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setBuyOpen(false)}
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
                      Purchase Allowlist for {recordName}
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setBuyOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <div className="mt-2 text-sm text-white">
                      {roleName ? (
                        <p>
                          Make sure you are in the projects{" "}
                          <span>
                            <a
                              href={discordInvite}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-400 underline"
                            >
                              discord server
                            </a>
                          </span>{" "}
                          as upon purchasing, you will receive the {roleName}{" "}
                          discord role.
                        </p>
                      ) : (
                        <p>
                          As there is no discord role associated to this
                          purchase, your wallet will simply be submitted into
                          the allowlist.
                        </p>
                      )}
                    </div>
                    <div className="mt-6 text-sm text-white flex flex-col">
                      <div>
                        <span className="font-bold">Your Points:</span>{" "}
                        {myPoints} points
                      </div>
                      <div>
                        <span className="font-bold">Total Cost:</span>{" "}
                        {recordPointCost} points
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setBuyOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-600"
                      onClick={buy}
                    >
                      Buy
                    </button>
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
