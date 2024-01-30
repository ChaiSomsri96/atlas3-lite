import {
  BulkAddWalletsInput,
  useHandleBulkAddWallets,
} from "@/frontend/handlers/useHandleBulkAddWallets";

import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { ErrorMessage, Label, TextArea } from "@/styles/FormComponents";
import { Dialog, Transition } from "@headlessui/react";
import { AllowlistType } from "@prisma/client";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";

export default function BulkAddWalletsSlideover({
  open,
  setOpen,
  project,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  project: ExtendedProject;
}) {
  const [walletsCount, setWalletsCount] = useState(0);
  const handleBulkAddWallets = useHandleBulkAddWallets();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BulkAddWalletsInput>();

  const onSubmit = (data: BulkAddWalletsInput) => {
    const loadingId = toast.loading(`Processing bulk add wallets...`);

    // TODO: save to db
    handleBulkAddWallets.mutate(
      {
        projectSlug: project.slug,
        wallets: data.wallets,
        multiplier: data.multiplier,
        roleName: data.roleName,
      },
      {
        onSuccess: () => {
          setOpen(false);

          toast.success("Bulk add wallets successful.", {
            id: loadingId,
          });
        },
        onError: (e) => {
          console.log("bulk add failed:", e);

          toast.error("Bulk add wallets failed.", {
            id: loadingId,
          });
        },
      }
    );
  };

  // split wallets by comma and update state
  const handleWalletsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const wallets = e.target.value.split(",").map((w) => w.trim());
    setWalletsCount(wallets.length);
    setValue("wallets", wallets);
  };

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
                          Bulk Add Wallets
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
                        <div className="space-y-4">
                          <div>
                            <Label>Wallets</Label>
                            <p className="text-xs">
                              Add comma seperated wallets
                            </p>

                            <div className="mt-1">
                              <TextArea
                                id="wallets"
                                onChange={handleWalletsChange}
                                rows={7}
                              />
                            </div>
                            <p className="text-sm">
                              Total wallets: {walletsCount}
                            </p>

                            {errors.wallets && (
                              <ErrorMessage>
                                {errors.wallets.message}
                              </ErrorMessage>
                            )}
                          </div>

                          {project.allowlist?.type ===
                            AllowlistType.DISCORD_ROLE && (
                            <>
                              <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-300"
                              >
                                Role Name
                              </label>
                              <div className="">
                                <select
                                  id="type"
                                  className="form-select block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                                  defaultValue={
                                    project.allowlist?.type ?? undefined
                                  }
                                  onChange={(e) => {
                                    const role = project.allowlist?.roles?.find(
                                      (x) => x.id === (e.target.value as string)
                                    );

                                    if (role) setValue("roleName", role.name);
                                  }}
                                >
                                  <option value={undefined}>Select One</option>
                                  {project.allowlist?.roles?.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Bulk Add Wallets
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
