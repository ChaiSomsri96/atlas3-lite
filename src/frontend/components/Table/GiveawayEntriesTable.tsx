import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import {
  ExtendedGiveawayEntry,
  useGiveawayEntries,
} from "@/frontend/hooks/useGiveawayEntries";
import { FilterOption, OAuthProviders, SortOption } from "@/shared/types";
import { shortenPublicKey } from "@/shared/utils";
import { Account, Project, User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import FilterButton from "../FilterButton";
import { Loader } from "../Loader";
import SortButton from "../SortButton";
import { infinitePageLength, InfiniteTable } from "./InfiniteTable";

const FILTER_OPTIONS: FilterOption[] = [
  {
    id: "status_WIN",
    name: "Win",
    checked: false,
  },
  {
    id: "status_LOST",
    name: "Lost",
    checked: false,
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    id: "name_asc",
    name: "Name",
  },
  {
    id: "name_desc",
    name: "Name",
  },
];

export const GiveawayEntriesTable = ({
  project,
  giveaway,
}: {
  project: Project;
  giveaway: ExtendedGiveaway;
}) => {
  const [page, setPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);
  const [entries, setEntries] = useState<ExtendedGiveawayEntry[]>();
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>("");

  const { data: ret, isLoading } = useGiveawayEntries({
    projectSlug: project.slug,
    giveawaySlug: giveaway.slug,
    page,
    pageLength: infinitePageLength,
    sortOption,
    filterOptions,
    search,
  });

  useEffect(() => {
    if (ret) {
      if (entries && page > 1) {
        setEntries([...entries, ...ret.entries]);
      } else {
        setEntries(ret.entries);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setEntries(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
    setEntries(undefined);
  };

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
    setEntries(undefined);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const cols = useMemo<ColumnDef<ExtendedGiveawayEntry>[]>(
    () => [
      {
        header: "User",
        cell: (col) => {
          const user = col.getValue() as User;
          return (
            <div className="flex gap-4 items-start pr-4">
              <img
                src={`${user.image}`}
                alt={user.name}
                className="w-8 h-8 rounded-md"
              />
              <div className="-mt-1">
                <h1 className="text-white text-xl font-semibold">
                  {user.name}
                </h1>
                <span className="text-md text-neutral-400">
                  Submitted:{" "}
                  {format(
                    new Date(col.row.original.createdAt),
                    "dd MMM yyyy HH:mm"
                  )}
                </span>
              </div>
            </div>
          );
        },
        accessorFn: (row) => row.user,
      },
      {
        header: "Wallet",
        cell: (col) => (
          <span className="text-lg">{`${shortenPublicKey(
            col.getValue() as string
          )}`}</span>
        ),
        accessorKey: "walletAddress",
      },
      {
        header: "Discord ID",
        cell: (col) => {
          const user = col.getValue() as User & { accounts: Account[] };
          const discordAccount =
            user.accounts &&
            user.accounts.find(
              (account) => account.provider === OAuthProviders.DISCORD
            );

          return (
            <span className="text-lg">{`${
              discordAccount ? discordAccount.username : "N/A"
            }`}</span>
          );
        },
        accessorFn: (row) => row.user,
      },
      {
        header: "IP Hash",
        cell: (col) => (
          <span className="text-lg">{`${
            shortenPublicKey(col.getValue() as string) ?? "N/A"
          }`}</span>
        ),
        accessorKey: "ipHash",
      },
      {
        header: "Confidence score",
        cell: (col) => {
          const score = col.getValue() as number | null;

          if (score === null || isNaN(score)) {
            return (
              <div className="bg-gray-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white text-xs">N/A</span>
              </div>
            );
          }

          if (score > 5) {
            return (
              <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white">{score}</span>
              </div>
            );
          } else if (score > 3) {
            return (
              <div className="bg-[#E1B84D] px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white">{score}</span>
              </div>
            );
          } else {
            return (
              <div className="bg-error-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <span className="text-white">{score}</span>
              </div>
            );
          }
        },
        accessorKey: "ipHash",
      },
      /*{
        header: "",
        id: "actions",
        cell: (col) => {
          const user = col.getValue() as User & { accounts: Account[] };

          return (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-transparent border border-primary-500 p-1 text-twitter">
                  <More size={16} />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({}) => (
                        <button
                          className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                          onClick={() => {
                            handleDeleteGiveawayEntry.mutate({
                              giveaway: giveaway,
                              userId: user.id,
                            });
                          }}
                        >
                          <div className="bg-slate-900 p-2 rounded-lg mr-4">
                            <Trash className="h-5 w-5" />
                          </div>
                          <span>Delete Entry</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          );
        },
        accessorFn: (row) => row.user,
      },*/
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
            placeholder="Search user or wallet"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-neutral-500">{total ?? "-"} Entries</span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
            />
            <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
          </div>
        </div>
      </div>

      {!entries && isLoading && <Loader />}

      {entries && (
        <InfiniteTable
          data={entries}
          columns={cols}
          total={total}
          isLoading={isLoading}
          isDropdownOpen={false}
          handleNext={handleNext}
        />
      )}
    </div>
  );
};
