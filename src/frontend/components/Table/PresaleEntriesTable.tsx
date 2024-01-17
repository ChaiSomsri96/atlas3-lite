import { ExtendedPresale } from "@/frontend/hooks/usePresale";
import {
  ExtendedPresaleEntry,
  usePresaleEntries,
} from "@/frontend/hooks/usePresaleEntries";
import { OAuthProviders } from "@/shared/types";
import { shortenPublicKey } from "@/shared/utils";
import { Account, Project, User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { Loader } from "../Loader";
import { infinitePageLength, InfiniteTable } from "./InfiniteTable";

export const PresaleEntriesTable = ({
  project,
  presale,
}: {
  project: Project;
  presale: ExtendedPresale;
}) => {
  const [page, setPage] = useState<number>(1);
  const [entries, setEntries] = useState<ExtendedPresaleEntry[]>();
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const { data: ret, isLoading } = usePresaleEntries({
    projectSlug: project.slug,
    presaleSlug: presale.slug,
    page,
    pageLength: infinitePageLength,
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

  const handleNext = () => {
    setPage(page + 1);
  };

  const cols = useMemo<ColumnDef<ExtendedPresaleEntry>[]>(
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
        header: "Amount",
        cell: (col) => (
          <span className="text-lg">{col.getValue() as string}</span>
        ),
        accessorKey: "entryAmount",
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
          <div className="flex gap-2"></div>
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
