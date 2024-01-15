import { useAllowlistRoles } from "@/frontend/hooks/useAllowlistRoles";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { usePaymentTokens } from "@/frontend/hooks/usePaymentTokens";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { useCollabProjects } from "@/frontend/hooks/useCollabProjects";
import { BlockchainNetwork, Project } from "@prisma/client";
import {
  RaffleInput,
  useHandleCreateRaffle,
} from "@/frontend/handlers/useHandleCreateRaffle";
import { SearchCollabProjectsSingle } from "../SearchCollabProjectsSingle";

export default function CreateEditRaffleSlideover({
  open,
  setOpen,
  raffle,
  refetch,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  raffle: ExtendedGiveaway | undefined;
  refetch: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RaffleInput>({});

  const collabProjectId = watch("collabProjectId");
  const nonAtlas3Project = watch("nonAtlas3Project");
  const maxWinners = watch("maxWinners");

  const [project, setProject] = useState<Project>();

  const discordRoles = useAllowlistRoles({
    projectId: collabProjectId,
    projectSlug: undefined,
  });

  const { data: paymentTokens } = usePaymentTokens();
  const [search, setSearchValue] = useState<string>("");

  const { data: allProjects } = useCollabProjects({
    page: 1,
    pageLength: 1000,
    search: search,
    sortOption: "",
    filterOptions: "",
    notMine: false,
  });

  const handleCreateRaffle = useHandleCreateRaffle();

  const onSubmit = async (data: RaffleInput) => {
    if (data) {
      console.log(data);

      await handleCreateRaffle.mutateAsync({
        id: raffle ? raffle?.id : undefined,
        ...data,
      });

      refetch();

      setOpen(false);
    }
  };

  useEffect(() => {
    if (project) {
      setProject(project);
      setValue(
        "name",
        `${isNaN(maxWinners) ? 0 : maxWinners} allowlist spots for ${
          project.name.trim() ?? ""
        }`
      );
    }
  }, [maxWinners, project]);

  useEffect(() => {
    if (raffle) {
      if (!raffle.collabProjectId) {
        {
          setValue("nonAtlas3Project", true);
          setValue("bannerImageUrl", raffle.bannerUrl ?? "");
          setValue("discordInviteUrl", raffle.discordInviteUrl ?? "");
          setValue("discordRoleName", raffle.discordRoleName ?? "");
          setValue("twitterUsername", raffle.twitterUsername ?? "");
        }
      }
      setValue("collabProjectId", raffle.collabProjectId ?? "");
      setValue("name", raffle.name);
      setValue("maxWinners", raffle.maxWinners);
      setValue(
        "endsAt",
        raffle.endsAt ? new Date(raffle.endsAt).toISOString().split(".")[0] : ""
      );
      setValue("network", raffle.network ? raffle.network : "Solana");
      setValue("paymentTokenId", raffle.paymentTokenId ?? "");
      setValue("paymentTokenAmount", raffle.paymentTokenAmount ?? 0);
      setValue("description", raffle.description ?? "");
    } else {
      setValue("collabProjectId", "");
      setValue("name", "");
      setValue("maxWinners", 0);
      setValue("endsAt", "");
      setValue("network", "Solana");
      setValue("paymentTokenId", "");
      setValue("paymentTokenAmount", 0);
      setValue("description", "");
      setValue("twitterUsername", "");
      setValue("discordInviteUrl", "");
      setValue("discordRoleName", "");
      setValue("bannerImageUrl", "");
      setValue("nonAtlas3Project", false);
    }

    console.log(raffle);
  }, [raffle]);

  useEffect(() => {
    if (
      raffle &&
      discordRoles &&
      discordRoles.data &&
      discordRoles.data.length > 0
    ) {
      setValue("giveawayRoleId", raffle.discordRoleId ?? "");
    }
  }, [discordRoles]);

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
                          {raffle ? "Edit Raffle" : "Create Raffle"}
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
                    {/* Main */}
                    <div className="mt-3 px-4 sm:px-6">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 sm:space-y-3 mb-4">
                          {!raffle && (
                            <div className="">
                              <div className="flex items-center my-4 gap-2">
                                <h2 className="block text-sm font-medium dark:text-white">
                                  Non Atlas3 Project
                                </h2>
                                <input
                                  id="nonAtlas3Project"
                                  type="checkbox"
                                  disabled={raffle !== undefined}
                                  {...register("nonAtlas3Project")}
                                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                />
                              </div>
                            </div>
                          )}
                          {!nonAtlas3Project && !raffle && (
                            <div>
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium mb-2 dark:text-white">
                                  Project
                                </label>
                                <span className="block text-sm text-gray-500 mb-2">
                                  Required
                                </span>
                              </div>

                              <SearchCollabProjectsSingle
                                allProjects={allProjects}
                                projectSlug={""}
                                collabType={"RECEIVE_SPOTS"}
                                setValue={(value) => {
                                  setValue("collabProjectId", value);
                                  setProject(
                                    allProjects?.projects.find(
                                      (x) => x.id === value
                                    )
                                  );
                                }}
                                {...register("collabProjectId")}
                                setSearchValue={setSearchValue}
                              />
                            </div>
                          )}
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
                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium mb-2 dark:text-white">
                                Giveaway Name
                              </label>
                              <span className="block text-sm text-gray-500 mb-2">
                                Required
                              </span>
                            </div>
                            <input
                              type="text"
                              id="name"
                              {...register("name")}
                              placeholder="Placeholder"
                              className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.name ? "border-red-500" : ""
                              }`}
                            />

                            {errors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          {nonAtlas3Project && (
                            <>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Description
                                  </label>
                                  <span className="block text-sm text-gray-500 mb-2">
                                    Required
                                  </span>
                                </div>

                                <textarea
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.description ? "border-red-500" : ""
                                  }`}
                                  rows={3}
                                  id="name"
                                  {...register("description")}
                                  placeholder="Placeholder"
                                />

                                {errors.description && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.description.message}
                                  </p>
                                )}
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Image URL
                                  </label>
                                  <span className="block text-sm text-gray-500 mb-2">
                                    Required
                                  </span>
                                </div>

                                <input
                                  type="text"
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.description ? "border-red-500" : ""
                                  }`}
                                  id="bannerImageUrl"
                                  {...register("bannerImageUrl")}
                                  placeholder="Placeholder"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Discord Invite URL
                                  </label>
                                  <span className="block text-sm text-gray-500 mb-2">
                                    Leave blank if not required
                                  </span>
                                </div>

                                <input
                                  type="text"
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.description ? "border-red-500" : ""
                                  }`}
                                  id="discordInviteUrl"
                                  {...register("discordInviteUrl")}
                                  placeholder="Placeholder"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Discord Role Name
                                  </label>
                                  <span className="block text-sm text-gray-500 mb-2">
                                    Leave blank if not required
                                  </span>
                                </div>

                                <input
                                  type="text"
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.description ? "border-red-500" : ""
                                  }`}
                                  id="discordServerId"
                                  {...register("discordRoleName")}
                                  placeholder="Placeholder"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Twitter URL
                                  </label>
                                  <span className="block text-sm text-gray-500 mb-2">
                                    Leave blank if not required
                                  </span>
                                </div>

                                <input
                                  type="text"
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.description ? "border-red-500" : ""
                                  }`}
                                  id="twitterUsername"
                                  {...register("twitterUsername")}
                                  placeholder="@user"
                                />
                              </div>
                            </>
                          )}

                          {!nonAtlas3Project && (
                            <div>
                              <p className="text-sm">Discord Role</p>
                              <select
                                id="giveawayRoleId"
                                {...register("giveawayRoleId")}
                                className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                  errors.giveawayRoleId ? "border-red-500" : ""
                                }`}
                              >
                                <option value={undefined}>Select One</option>
                                {discordRoles?.data?.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>

                              {errors.giveawayRoleId && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.giveawayRoleId.message}
                                </p>
                              )}
                            </div>
                          )}

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
                              defaultValue={
                                project?.network ?? BlockchainNetwork.Solana
                              }
                              className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                errors.name ? "border-red-500" : ""
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

                          <div className="">
                            <div className="flex items-end gap-3 sm:flex-row flex-col">
                              <div className="w-full">
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Payment Token
                                  </label>
                                </div>
                                <select
                                  id="paymentTokenId"
                                  {...register("paymentTokenId")}
                                  disabled={raffle !== undefined}
                                  className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.paymentTokenId
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select one</option>
                                  {paymentTokens &&
                                    paymentTokens.map((token) => (
                                      <option
                                        key={token.tokenAddress}
                                        value={token.id}
                                      >
                                        {token.tokenName}
                                      </option>
                                    ))}
                                </select>

                                {errors.paymentTokenId && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.paymentTokenId.message}
                                  </p>
                                )}
                              </div>

                              <div className="w-full">
                                <div className="flex justify-between items-center">
                                  <label className="block text-sm font-medium mb-2 dark:text-white">
                                    Token Amount
                                  </label>
                                </div>
                                <input
                                  type="number"
                                  step="0.01"
                                  onWheel={() => {
                                    if (
                                      document.activeElement instanceof
                                      HTMLElement
                                    ) {
                                      document?.activeElement?.blur();
                                    }
                                  }}
                                  id="paymentTokenAmount"
                                  disabled={raffle !== undefined}
                                  {...register("paymentTokenAmount", {
                                    valueAsNumber: true,
                                  })}
                                  placeholder=""
                                  className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                    errors.paymentTokenAmount
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                />

                                {errors.paymentTokenAmount && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors.paymentTokenAmount.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
                          >
                            {raffle ? "Update Raffle" : "Create Raffle"}
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
