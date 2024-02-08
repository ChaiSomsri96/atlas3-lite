import { useHandleSellMarketplaceRecord } from "@/frontend/handlers/useHandleSellMarketplaceRecord";
import { Dialog, Transition } from "@headlessui/react";
import { CloseSquare } from "iconsax-react";
import { Fragment } from "react";

type SellModalProps = {
  recordId: string | undefined;
  recordName: string | undefined;
  recordPointCost: number | undefined;
  isOpen: boolean;
  setBuyOpen: (isOpen: boolean) => void;
  refetch: () => void;
};

export const SellModal = ({
  recordId,
  recordName,
  recordPointCost,
  isOpen,
  setBuyOpen,
  refetch,
}: SellModalProps) => {
  const handleSellMarketplaceRecord = useHandleSellMarketplaceRecord();

  // 5% of recordPointCost
  const totalAmount = recordPointCost
    ? recordPointCost - recordPointCost * 0.05
    : 0;
  const projectFee = recordPointCost ? recordPointCost * 0.02 : 0;
  const platformFee = recordPointCost ? recordPointCost * 0.03 : 0;

  const sell = async () => {
    if (!recordId) return;

    handleSellMarketplaceRecord.mutateAsync(
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
                      Sell Allowlist for {recordName}
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
                    <div className="mt-6 text-sm text-white flex flex-col">
                      <div>
                        <span className="font-bold">Total Price:</span>{" "}
                        {recordPointCost} points
                      </div>
                      <div>
                        <span className="font-bold">Project Fee:</span>{" "}
                        {projectFee} points
                      </div>
                      <div>
                        <span className="font-bold">Platform Fee:</span>{" "}
                        {platformFee} points
                      </div>
                      <div className="mt-2">
                        <span className="font-bold">Points After Fees:</span>{" "}
                        {totalAmount} points
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
                      onClick={sell}
                    >
                      Sell
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
