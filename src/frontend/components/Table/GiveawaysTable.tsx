import { useHandleDeleteGiveaway } from "@/frontend/handlers/useHandleDeleteGiveaway";
import { useHandlePostGiveaway } from "@/frontend/handlers/useHandlePostGiveaway";
import { useHandleUpdateGiveawayState } from "@/frontend/handlers/useHandleUpdateGiveawayState";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { useProjectGiveaways } from "@/frontend/hooks/useProjectGiveaways";
import {
  FilterOption,
  GiveawayStatusFilters,
  NetworkFilters,
  SortOption,
} from "@/shared/types";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  BlockchainNetwork,
  CollabType,
  GiveawayStatus,
  Project,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Bank,
  CloseSquare,
  Copy,
  Edit,
  ExportSquare,
  Trash,
} from "iconsax-react";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { FaDiscord, FaFlagCheckered } from "react-icons/fa";
import { HiClipboard, HiMenu, HiSearch } from "react-icons/hi";
import FilterButton from "../FilterButton";
import SortButton from "../SortButton";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { Loader } from "../Loader";
import { InfiniteTable } from "./InfiniteTable";
import { CustomMenu } from "./CustomMenu";
import { useHandleClaimGiveaway } from "@/frontend/handlers/useHandleClaimGiveaway";

const FILTER_OPTIONS: FilterOption[] =
  GiveawayStatusFilters.concat(NetworkFilters);

const SORT_OPTIONS: SortOption[] = [
  {
    id: "endsAt_asc",
    name: "End Date",
  },
  {
    id: "endsAt_desc",
    name: "End Date",
  },
  {
    id: "entries_asc",
    name: "Entries Count",
  },
  {
    id: "entries_desc",
    name: "Entries Count",
  },
];

export const GiveawaysTable = ({ project }: { project: Project }) => {
  const [giveaways, setGiveaways] = useState<ExtendedGiveaway[]>();
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>(
    "status_RUNNING,status_FINALIZED"
  ); // Running, Finalized
  const [sortOption, setSortOption] = useState<string>("endsAt_desc"); // End Date as Descending

  const [duplicateSlug, setDuplicateSlug] = useState<string>();
  const [isDuplicateOpen, setDuplicateOpen] = useState<boolean>(false);
  const [isDeleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDropdownOpen, setDropdownOpen] = useState(true);

  const handleUpdateGiveawayState = useHandleUpdateGiveawayState();
  const handlePostGiveaway = useHandlePostGiveaway();
  const handleClaimGiveaway = useHandleClaimGiveaway();

  const { data: ret, isLoading } = useProjectGiveaways({
    projectSlug: project.slug,
    projectId: project.id,
    page,
    pageLength: 50,
    sortOption,
    filterOptions,
    search,
  });

  const handleDeleteGiveaway = useHandleDeleteGiveaway();

  useEffect(() => {
    if (ret) {
      if (giveaways && page > 1) {
        setGiveaways([...giveaways, ...ret.giveaways]);
      } else {
        setGiveaways(ret.giveaways);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setGiveaways(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
    setGiveaways(undefined);
  };

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
    setGiveaways(undefined);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleDuplicateOpen = (slug: string) => {
    console.log(slug);
    setDuplicateOpen(true);
    setDuplicateSlug(slug);
  };

  const handleDeleteOpen = (slug: string) => {
    setDeleteOpen(true);
    setDuplicateSlug(slug);
  };
  const handleDuplicate = () => {
    console.log(duplicateSlug);
    setDuplicateOpen(false);
  };

  const handleCopy = (path: string) => {
    const origin = window.location.origin;
    window.navigator.clipboard.writeText(origin + path);
  };

  const cols = useMemo<ColumnDef<ExtendedGiveaway>[]>(
    () => [
      {
        header: "Title",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <Link
              href={`/creator/project/${project.slug}/giveaways/${obj.slug}/entries`}
            >
              <div className="flex gap-2">
                {NetworkIcon[obj.network ?? BlockchainNetwork.Solana]}
                <div className="-mt-1 flex flex-col">
                  <h1 className="text-white text-xl font-semibold">
                    {obj.name.length > 30
                      ? obj.name.slice(0, 30) + "..."
                      : obj.name}
                  </h1>
                  <span className="text-md text-neutral-400">
                    Created:{" "}
                    {format(
                      Date.parse(obj.createdAt.toString()),
                      "dd EEE, hh:mm aa"
                    )}
                  </span>
                  {obj.collabProject && (
                    <span className="text-md text-success-500">
                      {/*if project slug matches this page, then has to be the other project*/}
                      Collab with{" "}
                      {obj.project.slug === project.slug
                        ? obj.collabProject.name
                        : obj.project.slug}
                    </span>
                  )}
                  <>
                    <div className="flex flex-row gap-2">
                      <div
                        className={`${
                          obj.type === "FCFS"
                            ? `bg-[#FBE3CC]`
                            : `bg-primary-100`
                        } px-3 py-1 rounded-md flex gap-2 items-center w-fit`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            obj.type === "FCFS"
                              ? `bg-[#EA7000]`
                              : `bg-primary-500`
                          }`}
                        ></div>
                        <span
                          className={
                            obj.type === "FCFS"
                              ? `text-[#EA7000]`
                              : `text-primary-500`
                          }
                        >
                          {obj.type === "FCFS" ? "FCFS" : "Raffle"}
                        </span>
                      </div>
                      {obj.status === GiveawayStatus.DRAFT && (
                        <div className="bg-[#E1B84D] px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Draft</span>
                        </div>
                      )}
                      {obj.status === GiveawayStatus.RUNNING && (
                        <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Live</span>
                        </div>
                      )}
                      {obj.status === GiveawayStatus.COLLAB_PENDING && (
                        <div className="bg-[#E1B84D] px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Collab Pending</span>
                        </div>
                      )}
                      {obj.status === GiveawayStatus.COLLAB_READY && (
                        <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Colab Ready</span>
                        </div>
                      )}
                      {obj.status === GiveawayStatus.COLLAB_REJECTED && (
                        <div className="bg-red-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Rejected</span>
                        </div>
                      )}
                      {obj.status === GiveawayStatus.FINALIZED && (
                        <div className="bg-red-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Ended</span>
                        </div>
                      )}
                    </div>
                    {obj.teamSpots && (
                      <div className="bg-primary-500 mt-2 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <span className="text-white">Team Spots</span>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </Link>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Spots",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => row.maxWinners ?? 0,
      },
      {
        header: "Entries",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => row.entryCount,
      },
      {
        header: "End Date (Local Time)",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => {
          return (
            row.endsAt &&
            format(Date.parse(row.endsAt.toString()), "dd EEE, hh:mm aa")
          );
        },
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const giveaway = col.getValue() as ExtendedGiveaway;
          const slug = giveaway.slug;

          return (
            <div className="flex gap-2">
              <Link
                href={`/project/${project.slug}/giveaway/${slug}`}
                target="_blank"
              >
                <button className="p-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500">
                  <ExportSquare size={16} />
                </button>
              </Link>

              <CustomMenu handleMenuOpen={setDropdownOpen}>
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({}) => (
                        <button
                          className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                          onClick={() =>
                            handleCopy(
                              `/project/${project.slug}/giveaway/${slug}`
                            )
                          }
                        >
                          <div className="bg-slate-900 p-2 rounded-lg mr-4">
                            <HiClipboard className="h-5 w-5" />
                          </div>
                          <span>Copy to clipboard</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({}) => (
                        <Link
                          href={`/creator/project/${project.slug}/giveaways/${slug}/entries`}
                        >
                          <button
                            className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                          >
                            <div className="bg-slate-900 p-2 rounded-lg mr-4">
                              <HiMenu className="h-5 w-5" />
                            </div>
                            <span>View entries</span>
                          </button>
                        </Link>
                      )}
                    </Menu.Item>
                    {!giveaway.collabProject && (
                      <>
                        <Menu.Item>
                          {({}) => (
                            <Link
                              href={`/creator/project/${project.slug}/giveaways/${slug}/edit`}
                            >
                              <button
                                className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                              >
                                <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                  <Edit className="h-5 w-5" />
                                </div>
                                <span>Edit</span>
                              </button>
                            </Link>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({}) => (
                            <button
                              className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                              onClick={() => handleDuplicateOpen(slug)}
                            >
                              <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                <Copy className="h-5 w-5" />
                              </div>
                              <span>Duplicate</span>
                            </button>
                          )}
                        </Menu.Item>
                      </>
                    )}
                    {giveaway.collabProject && (
                      <Menu.Item>
                        {({}) => (
                          <Link
                            href={`/creator/project/${project.slug}/giveaways/${slug}/editCollabGiveaway`}
                          >
                            <button
                              className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                            >
                              <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                <Edit className="h-5 w-5" />
                              </div>
                              <span>Edit Giveaway</span>
                            </button>
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    {giveaway.status !== GiveawayStatus.FINALIZED && (
                      <Menu.Item>
                        {({}) => (
                          <button
                            className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                            onClick={() => {
                              handleUpdateGiveawayState.mutate({
                                projectSlug: project.slug,
                                giveawaySlug: slug,
                                status: GiveawayStatus.FINALIZED,
                                spots: 0,
                              });
                            }}
                          >
                            <div className="bg-slate-900 p-2 rounded-lg mr-4">
                              <FaFlagCheckered className="h-4 w-4" />
                            </div>
                            <span>End Giveaway</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {giveaway.status === GiveawayStatus.RUNNING && (
                      <>
                        {((giveaway.collabProjectId &&
                          giveaway.collabType === CollabType.RECEIVE_SPOTS &&
                          giveaway.projectId === project.id) ||
                          (giveaway.collabProjectId &&
                            giveaway.collabType === CollabType.GIVE_SPOTS &&
                            giveaway.collabProjectId === project.id) ||
                          !giveaway.collabProjectId) && (
                          <Menu.Item>
                            {({}) => (
                              <button
                                className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                                onClick={() => {
                                  handlePostGiveaway.mutate({
                                    projectSlug: project.slug,
                                    giveawaySlug: slug,
                                  });
                                }}
                              >
                                <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                  <FaDiscord className="h-4 w-4" />
                                </div>
                                <span>Post to discord</span>
                              </button>
                            )}
                          </Menu.Item>
                        )}
                      </>
                    )}
                    {giveaway.paymentToken &&
                      giveaway.status == GiveawayStatus.FINALIZED &&
                      giveaway.entryCount > 0 &&
                      !giveaway.withdraw &&
                      !giveaway.adminCreated && (
                        <Menu.Item>
                          {({}) => (
                            <button
                              className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                              onClick={() => {
                                handleClaimGiveaway.mutate({
                                  projectSlug: project.slug,
                                  giveawaySlug: slug,
                                });
                              }}
                            >
                              <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                <Bank className="h-5 w-5" />
                              </div>
                              <span>Claim Funds</span>
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    <Menu.Item>
                      {({}) => (
                        <button
                          className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                          onClick={() => handleDeleteOpen(slug)}
                        >
                          <div className="bg-slate-900 p-2 rounded-lg mr-4">
                            <Trash className="h-5 w-5" />
                          </div>
                          <span>Delete Giveaway</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </CustomMenu>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center mt-8 gap-4">
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center sm:w-fit w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search giveaway"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-neutral-500">
            {total ?? "-"} Total Giveaways
          </span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
              defaultFilterOptions={[
                FILTER_OPTIONS.find((item) => item.id === "status_RUNNING"),
                FILTER_OPTIONS.find((item) => item.id === "status_FINALIZED"),
              ]}
            />
            <SortButton
              sortOptions={SORT_OPTIONS}
              handleSort={handleSort}
              defaultSort={SORT_OPTIONS.find(
                (item) => item.id === "endsAt_desc"
              )}
            />
          </div>
        </div>
      </div>

      {!giveaways && isLoading && <Loader />}

      {giveaways && (
        <InfiniteTable
          data={giveaways}
          columns={cols}
          total={total}
          isLoading={isLoading}
          isDropdownOpen={isDropdownOpen}
          handleNext={handleNext}
        />
      )}

      <Transition appear show={isDuplicateOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setDuplicateOpen(false)}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Duplicate Gateway?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setDuplicateOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-white">
                      This will make a clone of this giveaway. Are you sure you
                      want to do that?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setDuplicateOpen(false)}
                    >
                      Cancel
                    </button>
                    <Link
                      href={`/creator/project/${project.slug}/giveaways/${duplicateSlug}/duplicate`}
                    >
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={handleDuplicate}
                      >
                        Yes, duplicate giveaway
                      </button>
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setDeleteOpen(false)}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Delete Giveaway?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setDeleteOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-white">
                      Are you sure you want to delete this giveaway?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setDeleteOpen(false)}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-red-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        if (!duplicateSlug) return;

                        handleDeleteGiveaway.mutate({
                          projectSlug: project.slug,
                          giveawaySlug: duplicateSlug,
                        });
                        setDeleteOpen(false);
                      }}
                    >
                      Yes, delete giveaway
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
