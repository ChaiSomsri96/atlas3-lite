/*import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { BlockchainNetwork } from "@prisma/client";
import { ExtendedLottery } from "@/frontend/hooks/useRunningLottery";
import {
  LotteryInput,
  useHandleCreateLottery,
} from "@/frontend/handlers/useHandleCreateLottery";

export default function CreateEditLotterySlideover({
  open,
  setOpen,
  lottery,
  refetch,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  lottery: ExtendedLottery | undefined;
  refetch: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LotteryInput>({});

  const handleCreateLottery = useHandleCreateLottery();

  const onSubmit = async (data: LotteryInput) => {
    if (data) {
      console.log(data);

      await handleCreateLottery.mutateAsync({
        id: lottery ? lottery?.id : undefined,
        ...data,
      });

      refetch();

      setOpen(false);
    }
  };
  useEffect(() => {
    if (lottery) {
      setValue("maxWinners", lottery.maxWinners);
      setValue(
        "endsAt",
        lottery.endsAt
          ? new Date(lottery.endsAt).toISOString().split(".")[0]
          : ""
      );
      setValue("network", lottery.network ? lottery.network : "Solana");
      setValue("jackpotImageUrl", lottery.jackpotReward?.imageUrl);
      setValue("jackpotName", lottery.jackpotReward?.name);
      setValue("usdReward", lottery.usdReward ?? 0);
    } else {
      setValue("maxWinners", 5);
      setValue("endsAt", "");
      setValue("network", "Solana");
      setValue("jackpotImageUrl", "");
      setValue("jackpotName", "");
      setValue("usdReward", 170);
    }
  }, [lottery]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-dark-700 shadow-2xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2
                          id="slide-over-heading"
                          className="text-xl font-semibold"
                        >
                          {lottery ? "Edit Lottery" : "Create Lottery"}
                        </h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-lg text-primary-500 border-2 p-1 border-primary-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <RxCross2 className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Main 
                    <div className="mt-3 px-4 sm:px-6">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 sm:space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium mb-2 dark:text-white">
                                USD Reward
                              </label>
                              <span className="block text-sm text-gray-500 mb-2">
                                Required
                              </span>
                            </div>
                            <input
                              type="number"
                              onWheel={() => {
                                if (
                                  document.activeElement instanceof HTMLElement
                                ) {
                                  document?.activeElement?.blur();
                                }
                              }}
                              id="usdReward"
                              {...register("usdReward", {
                                valueAsNumber: true,
                              })}
                              placeholder="Placeholder"
                              className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.usdReward ? "border-red-500" : ""
                              }`}
                            />

                            {errors.maxWinners && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.maxWinners.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium mb-2 dark:text-white">
                                Winners Count
                              </label>
                              <span className="block text-sm text-gray-500 mb-2">
                                Required
                              </span>
                            </div>
                            <input
                              type="number"
                              onWheel={() => {
                                if (
                                  document.activeElement instanceof HTMLElement
                                ) {
                                  document?.activeElement?.blur();
                                }
                              }}
                              id="maxWinners"
                              {...register("maxWinners", {
                                valueAsNumber: true,
                              })}
                              placeholder="Placeholder"
                              className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.maxWinners ? "border-red-500" : ""
                              }`}
                            />

                            {errors.maxWinners && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.maxWinners.message}
                              </p>
                            )}
                          </div>
                          <>
                            <div>
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium mb-2 dark:text-white">
                                  Jackpot Name
                                </label>
                                <span className="block text-sm text-gray-500 mb-2">
                                  Required
                                </span>
                              </div>

                              <input
                                type="text"
                                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                  errors.jackpotName ? "border-red-500" : ""
                                }`}
                                id="jackpotName"
                                {...register("jackpotName")}
                                placeholder="Placeholder"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium mb-2 dark:text-white">
                                  Jackpot Image URL
                                </label>
                                <span className="block text-sm text-gray-500 mb-2">
                                  Required
                                </span>
                              </div>

                              <input
                                type="text"
                                className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                  errors.jackpotImageUrl ? "border-red-500" : ""
                                }`}
                                id="jackpotImageUrl"
                                {...register("jackpotImageUrl")}
                                placeholder="Placeholder"
                              />
                            </div>
                          </>

                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium mb-2 dark:text-white">
                                End Date (Local Time)
                              </label>
                              <span className="block text-sm text-gray-500 mb-2">
                                Required
                              </span>
                            </div>
                            <input
                              type="datetime-local"
                              id="name"
                              {...register("endsAt")}
                              step="any"
                              placeholder="Placeholder"
                              className={`input[type='datetime'] w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.endsAt ? "border-red-500" : ""
                              }`}
                            />

                            {errors.endsAt && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.endsAt.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium dark:text-white">
                                Network of wallets to collect
                              </label>
                            </div>
                            <p className="text-xs mb-2">
                              The network of wallets that you want to collect as
                              part of this giveaway. By default it will be set
                              to the projects network.
                            </p>
                            <select
                              id="network"
                              {...register("network")}
                              defaultValue={BlockchainNetwork.Solana}
                              className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.network ? "border-red-500" : ""
                              }`}
                            >
                              {Object.values(BlockchainNetwork).map(
                                (network) => (
                                  <option key={network} value={network}>
                                    <>{network}</>
                                  </option>
                                )
                              )}
                            </select>
                            {watch("network") === "TBD" && (
                              <label className="block text-sm font-medium text-amber-500 mt-2">
                                No wallets will be collected as `Network of
                                wallets to collect` is set to TBD. Only users
                                will be collected.
                              </label>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
                          >
                            {lottery ? "Update Lottery" : "Create Lottery"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
*/

export {};
