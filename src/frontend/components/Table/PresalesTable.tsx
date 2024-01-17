import {
  FilterOption,
  PresaleStatusFilters,
  NetworkFilters,
  SortOption,
} from "@/shared/types";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork, PresaleStatus, Project } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, ExportSquare } from "iconsax-react";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { FaFlagCheckered } from "react-icons/fa";
import { HiClipboard, HiMenu, HiSearch } from "react-icons/hi";
import FilterButton from "../FilterButton";
import SortButton from "../SortButton";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { Loader } from "../Loader";
import { InfiniteTable } from "./InfiniteTable";
import { CustomMenu } from "./CustomMenu";
import { useProjectPresales } from "@/frontend/hooks/useProjectPresales";
import { useHandleUpdatePresaleState } from "@/frontend/handlers/useHandleUpdatePresaleState";
import { ExtendedPresale } from "@/frontend/hooks/usePresale";

const FILTER_OPTIONS: FilterOption[] =
  PresaleStatusFilters.concat(NetworkFilters);

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

export const PresalesTable = ({ project }: { project: Project }) => {
  const [presales, setPresales] = useState<ExtendedPresale[]>();
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>();
  const [totalEntries, setTotalEntries] = useState<number>();
  const [totalRevenue, setTotalRevenue] = useState<number>();

  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>(
    "status_RUNNING,status_FINALIZED"
  ); // Running, Finalized
  const [sortOption, setSortOption] = useState<string>("endsAt_desc"); // End Date as Descending

  const [isDeleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isDropdownOpen, setDropdownOpen] = useState(true);

  const handleUpdatePresaleState = useHandleUpdatePresaleState();

  const { data: ret, isLoading } = useProjectPresales({
    projectSlug: project.slug,
    projectId: project.id,
    page,
    pageLength: 50,
    sortOption,
    filterOptions,
    search,
  });

  useEffect(() => {
    if (ret) {
      if (presales && page > 1) {
        setPresales([...presales, ...ret.presales]);
      } else {
        setPresales(ret.presales);
      }

      setTotal(ret.total);
      setTotalEntries(ret.totalEntryCount);
      setTotalRevenue(ret.totalRevenue);
    }
  }, [ret]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setPresales(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
    setPresales(undefined);
  };

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
    setPresales(undefined);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleCopy = (path: string) => {
    const origin = window.location.origin;
    window.navigator.clipboard.writeText(origin + path);
  };

  const cols = useMemo<ColumnDef<ExtendedPresale>[]>(
    () => [
      {
        header: "Title",
        cell: (col) => {
          const obj = col.getValue() as ExtendedPresale;
          return (
            <Link
              href={`/creator/project/${project.slug}/presales/${obj.slug}/entries`}
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
                  <>
                    <div className="flex flex-row gap-2">
                      {obj.status === PresaleStatus.RUNNING && (
                        <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Live</span>
                        </div>
                      )}
                      {obj.status === PresaleStatus.FINALIZED && (
                        <div className="bg-red-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-white">Ended</span>
                        </div>
                      )}
                    </div>
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
        accessorFn: (row) => row.supply ?? 0,
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
          const presale = col.getValue() as ExtendedPresale;
          const slug = presale.slug;

          return (
            <div className="flex gap-2">
              <Link
                href={`/project/${project.slug}/presale/${slug}`}
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
                              `/project/${project.slug}/presale/${slug}`
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
                          href={`/creator/project/${project.slug}/presales/${slug}/entries`}
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
                    <Menu.Item>
                      {({}) => (
                        <Link
                          href={`/creator/project/${project.slug}/presales/${slug}/edit-presale`}
                        >
                          <button
                            className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                          >
                            <div className="bg-slate-900 p-2 rounded-lg mr-4">
                              <Edit className="h-5 w-5" />
                            </div>
                            <span>Edit Presale</span>
                          </button>
                        </Link>
                      )}
                    </Menu.Item>
                    {presale.status !== PresaleStatus.FINALIZED && (
                      <Menu.Item>
                        {({}) => (
                          <button
                            className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                            onClick={() => {
                              handleUpdatePresaleState.mutate({
                                projectSlug: project.slug,
                                presaleSlug: slug,
                                status: PresaleStatus.FINALIZED,
                              });
                            }}
                          >
                            <div className="bg-slate-900 p-2 rounded-lg mr-4">
                              <FaFlagCheckered className="h-4 w-4" />
                            </div>
                            <span>End Presale</span>
                          </button>
                        )}
                      </Menu.Item>
                    )}
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
            placeholder="Search presale"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-white-500">{total ?? "-"} Total Presales</span>
          <span className="text-white-500">
            {totalEntries ?? "-"} Total Entries
          </span>
          <span className="text-white-500">
            ${(totalRevenue ?? 0) / 1000} Total Revenue
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

      {!presales && isLoading && <Loader />}

      {presales && (
        <InfiniteTable
          data={presales}
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
        </Dialog>
      </Transition>
    </div>
  );
};
