import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import {
  BlockchainNetwork,
  CollabType,
  GiveawayStatus,
  Project,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CloseSquare, ExportSquare, Trash } from "iconsax-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useProjectGiveawayRequests } from "@/frontend/hooks/useProjectGiveawayRequests";
import SortButton from "../SortButton";
import FilterButton from "../FilterButton";
import {
  FilterOption,
  GiveawayStatusFilters,
  NetworkFilters,
  SortOption,
} from "@/shared/types";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useHandleDeleteGiveaway } from "@/frontend/handlers/useHandleDeleteGiveaway";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { infinitePageLength, InfiniteTable } from "./InfiniteTable";
import { Loader } from "../Loader";
import { CustomMenu } from "./CustomMenu";

const FILTER_OPTIONS: FilterOption[] =
  GiveawayStatusFilters.concat(NetworkFilters);

const SORT_OPTIONS: SortOption[] = [
  {
    id: "endDate_asc",
    name: "End Date",
  },
  {
    id: "endDate_desc",
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

export const GiveawayOutgoingTable = ({
  project,
  collabType,
}: {
  project: Project;
  collabType: CollabType;
}) => {
  const [page, setPage] = useState<number>(1);
  const [giveaways, setGiveaways] = useState<ExtendedGiveaway[]>();
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);

  const [deleteSlug, setDeleteSlug] = useState<string>();
  const handleDeleteGiveaway = useHandleDeleteGiveaway();
  const [isDeleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDropdownOpen, setDropdownOpen] = useState(true);

  const { data: ret, isLoading } = useProjectGiveawayRequests({
    projectSlug: project.slug,
    collabType,
    page,
    pageLength: infinitePageLength,
    sortOption,
    filterOptions,
    search,
  });

  useEffect(() => {
    if (ret) {
      if (giveaways && page > 1) {
        setGiveaways([...giveaways, ...ret.requests]);
      } else {
        setGiveaways(ret.requests);
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

  const handleDeleteOpen = (slug: string) => {
    setDeleteOpen(true);
    setDeleteSlug(slug);
  };

  const cols = useMemo<ColumnDef<ExtendedGiveaway>[]>(
    () => [
      {
        header: "Offer to",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <Link
              className="flex gap-2"
              href={`/project/${obj.collabProject?.slug}`}
            >
              <img
                src={
                  obj.collabProject?.imageUrl ??
                  "/images/AvatarPlaceholder-1.png"
                }
                className="w-10 h-10 rounded-lg"
                alt=""
              />
              <div className="-mt-1">
                <h1 className="text-white text-xl font-semibold">
                  {obj.collabProject?.name
                    ? obj.collabProject.name.length > 20
                      ? obj.collabProject.name.substring(0, 20) + "..."
                      : obj.collabProject.name
                    : ""}
                </h1>
                <span className="text-md text-neutral-400">
                  Sent:{" "}
                  {format(
                    Date.parse(obj.createdAt.toString()),
                    "dd EEE, hh:mm aa"
                  )}
                </span>
              </div>
            </Link>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Title",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <div className="flex gap-2">
              {NetworkIcon[obj.network ?? BlockchainNetwork.Solana]}
              <div className="-mt-1">
                <h1 className="text-white text-xl font-semibold">
                  {obj.name.length > 30
                    ? obj.name.slice(0, 30) + "..."
                    : obj.name}
                </h1>
                <span className="text-md text-neutral-400">
                  Sent:{" "}
                  {format(
                    Date.parse(obj.createdAt.toString()),
                    "dd EEE, hh:mm aa"
                  )}
                </span>
                <>
                  <div className="flex flex-row gap-2">
                    <div
                      className={`${
                        obj.type === "FCFS" ? `bg-[#FBE3CC]` : `bg-primary-100`
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
                      <>
                        {obj.countered ? (
                          <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <span className="text-white">
                              Live, countered with {obj.maxWinners} spots
                            </span>
                          </div>
                        ) : (
                          <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit float-left">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <span className="text-white">Live</span>
                          </div>
                        )}
                      </>
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
                </>
              </div>
            </div>
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
        header: "Request Deadline",
        cell: (col) => (
          <span className="text-lg">{`${format(
            new Date(col.getValue() as string),
            "dd EEE, hh:mm aa"
          )}`}</span>
        ),
        accessorFn: (row) => row.collabRequestDeadline,
      },
      {
        header: "Duration (Hours)",
        cell: (col) => col.renderValue(),
        accessorFn: (row) => row.collabDuration,
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

              {giveaway.status === GiveawayStatus.COLLAB_PENDING && (
                <CustomMenu handleMenuOpen={setDropdownOpen}>
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
                    <div className="px-1 py-1">
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
              )}
            </div>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    [giveaways]
  );

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center mt-8 gap-4">
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center sm:w-fit w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-neutral-500">{total ?? 0} requests sent</span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
            />
            <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <span className="text-white">
            {collabType === "RECEIVE_SPOTS"
              ? "These are your outgoing requests to REQUEST allowlists spots from ANOTHER project."
              : "These are your outgoing requests to GIVE another project allowlist spots."}{" "}
          </span>
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
                      Are you sure you want to delete this giveaway request?
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
                        if (!deleteSlug) return;

                        handleDeleteGiveaway.mutate({
                          projectSlug: project.slug,
                          giveawaySlug: deleteSlug,
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
