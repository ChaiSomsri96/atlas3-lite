import {
  CreateOrUpdateAllowlistInput,
  useHandleCreateOrUpdateAllowlist,
} from "@/frontend/handlers/useHandleCreateOrUpdateAllowlist";
import { useRoles } from "@/frontend/hooks/useDiscordRoles";

import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { Dialog, Transition } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { AllowlistType } from "@prisma/client";

import { Fragment, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import * as Yup from "yup";

export default function CreateWalletCollectionSlideover({
  open,
  setOpen,
  project,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  project: ExtendedProject;
}) {
  const handleCreateOrUpdateAllowlist = useHandleCreateOrUpdateAllowlist();
  const [selectedAllowlistType, setSelectedAllowlistType] =
    useState<AllowlistType | null>(null);
  const roles = useRoles({ project });

  const validationSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    maxCap: Yup.number()
      .nullable()
      .transform((value) =>
        isNaN(value) || value === null || value === undefined ? null : value
      )
      .min(1, "Max cap must be greater than 0"),
    closesAt: Yup.date()
      .nullable()
      .transform((value) =>
        isNaN(value) || value === null || value === undefined ? null : value
      )
      .min(new Date(), "Closes at should be greater than now"),
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateOrUpdateAllowlistInput>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type: project.allowlist ? project.allowlist.type : undefined,
      maxCap: project.allowlist ? project.allowlist.maxCap : null,
      closesAt: project.allowlist
        ? project.allowlist.closesAt
        : new Date().toISOString(),
      roles: project.allowlist?.roles || [],
    },
  });

  useEffect(() => {
    if (project.allowlist) {
      reset({
        type: project.allowlist ? project.allowlist.type : AllowlistType.DTC,
        maxCap: project.allowlist ? project.allowlist.maxCap : null,
        closesAt: project.allowlist
          ? project.allowlist.closesAt
          : new Date().toISOString(),
        roles: project.allowlist?.roles || [],
      });

      onSelectType(project.allowlist.type ?? AllowlistType.DISCORD_ROLE);
    }
  }, [project]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  const onSelectType = (type: AllowlistType) => {
    setValue("type", type);
    setSelectedAllowlistType(type);
  };

  const onSubmit = (data: CreateOrUpdateAllowlistInput) => {
    const action = project.allowlist ? "update" : "create";
    const extendedData: CreateOrUpdateAllowlistInput = {
      ...data,
      project,
      action,
      roles: data.type === AllowlistType.DISCORD_ROLE ? data.roles : [],
    };

    handleCreateOrUpdateAllowlist.mutate(extendedData, {
      onSuccess: () => {
        setOpen(false);
      },
    });
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
                          {project.allowlist ? "Edit" : "Create"} Wallet
                          Collection
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
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Type
                            </label>

                            {selectedAllowlistType ===
                              AllowlistType.DISCORD_ROLE && (
                              <p className="text-xs my-2 text-gray-400">
                                Discord Role: Discord roles are required to be
                                allowlisted. The roles must be in the same
                                server as the verified Discord server.
                              </p>
                            )}

                            <div className="mt-1">
                              <select
                                id="type"
                                className="form-select block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                                defaultValue={
                                  project.allowlist?.type ?? undefined
                                }
                                onChange={(e) =>
                                  onSelectType(
                                    AllowlistType[
                                      e.target.value as AllowlistType
                                    ]
                                  )
                                }
                              >
                                <option value={undefined}>Select One</option>
                                {Object.keys(AllowlistType).map((type) => (
                                  <option key={type} value={type}>
                                    <>
                                      {
                                        {
                                          [AllowlistType.DISCORD_ROLE]:
                                            "Discord Role",
                                          [AllowlistType.DTC]:
                                            "DTC: Direct To Contract",
                                        }[type]
                                      }
                                    </>
                                  </option>
                                ))}
                              </select>
                            </div>
                            {errors.type && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.type.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="closesAt"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Closes At (Local Time)
                            </label>
                            <div className="mt-1">
                              <input
                                type="datetime-local"
                                id="closesAt"
                                {...register("closesAt")}
                                className="block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                              />
                            </div>

                            {errors.closesAt && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.closesAt.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="maxCap"
                              className="block text-sm font-medium text-gray-300"
                            >
                              Max Cap (optional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                onWheel={() => {
                                  if (
                                    document.activeElement instanceof
                                    HTMLElement
                                  ) {
                                    document?.activeElement?.blur();
                                  }
                                }}
                                id="maxCap"
                                {...register("maxCap")}
                                className="block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                              />
                            </div>

                            {errors.maxCap && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.maxCap.message}
                              </p>
                            )}
                          </div>

                          {!project.discordGuild &&
                            selectedAllowlistType ===
                              AllowlistType.DISCORD_ROLE && (
                              <p className="mt-1 text-sm text-red-500">
                                Please connect your Discord server before
                                attempting to setup a discord based allowlist
                              </p>
                            )}

                          {project.discordGuild &&
                            selectedAllowlistType ===
                              AllowlistType.DISCORD_ROLE &&
                            fields.map((field, index) => (
                              <div
                                className="space-y-4 sm:space-y-3 p-3 bg-dark-600 rounded-lg"
                                key={`${field.id}-${index}`}
                              >
                                <div className="flex justify-between">
                                  <p>Role {index + 1}</p>

                                  <button
                                    type="button"
                                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                                    onClick={() => remove(index)}
                                  >
                                    Remove Role
                                  </button>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium mb-2 dark:text-white">
                                      Role Name
                                    </label>
                                  </div>
                                  <input
                                    type="text"
                                    id={`roles.${index}.name`}
                                    {...register(`roles.${index}.name`)}
                                    placeholder="Placeholder"
                                    className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                      errors?.roles?.[index]?.name
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    disabled={true}
                                  />
                                  {errors?.roles?.[index]?.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                      {errors?.roles?.[index]?.name?.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium mb-2 dark:text-white">
                                      Role ID
                                    </label>
                                  </div>
                                  <input
                                    type="number"
                                    onWheel={() => {
                                      if (
                                        document.activeElement instanceof
                                        HTMLElement
                                      ) {
                                        document?.activeElement?.blur();
                                      }
                                    }}
                                    id={`rol`}
                                    {...register(`roles.${index}.id`)}
                                    disabled={true}
                                    placeholder="Placeholder"
                                    className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
                                      errors?.roles?.[index]?.id
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                  />
                                  {errors?.roles?.[index]?.id && (
                                    <p className="mt-2 text-sm text-red-600">
                                      {errors?.roles?.[index]?.id?.message}
                                    </p>
                                  )}
                                </div>

                                {/*<div>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium mb-2 dark:text-white">
          Multiplier
        </label>
      </div>
      <input
        type="number"
        id={`roles.${index}.multiplier`}
        {...register(`roles.${index}.multiplier`, {
          valueAsNumber: true,
        })}
        placeholder="Placeholder"
        className={`form-input w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400 ${
          errors?.roles?.[index]?.multiplier
            ? "border-red-500"
            : ""
        }`}
      />
      {errors?.roles?.[index]?.multiplier && (
        <p className="mt-2 text-sm text-red-600">
          {
            errors?.roles?.[index]?.multiplier
              ?.message
          }
        </p>
      )}
        </div>*/}
                              </div>
                            ))}

                          {project.discordGuild &&
                            selectedAllowlistType ===
                              AllowlistType.DISCORD_ROLE && (
                              <>
                                <div>
                                  <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-300"
                                  >
                                    Add New Role
                                  </label>

                                  <div className="mt-1">
                                    <select
                                      id="type"
                                      className="form-select block w-full shadow-sm sm:text-sm bg-dark-500 border-gray-600 rounded-md"
                                      onChange={(e) => {
                                        const role = roles.data?.find(
                                          (role) => role.id === e.target.value
                                        );

                                        if (role) {
                                          append({
                                            name: role.name,
                                            id: role.id,
                                          });
                                        }
                                      }}
                                    >
                                      <option value={undefined}>
                                        Select One
                                      </option>
                                      {roles.data?.map((role) => (
                                        <option key={role.id} value={role.id}>
                                          {role.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </>
                            )}

                          <div className="flex justify-between">
                            <button
                              type="submit"
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              {project.allowlist ? "Save" : "Create"} Wallet
                              Collection
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* {project.allowlist && (
                        <button
                          type="button"
                          className="mt-4 inline-flex justify-center py-2 px-4 shadow-sm text-sm font-medium rounded-lg text-red-500 border border-red-500 hover:bg-red-100/20"
                          onClick={() => {
                            handleDeleteAllowlist.mutate({
                              project,
                            });
                          }}
                        >
                          Delete Wallet Collection
                        </button>
                      )} */}
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
