import { useCollectedWallets } from "@/frontend/hooks/useCollectedWallets";
import { ExtendedAllowlistEntry } from "@/pages/api/creator/project/[projectSlug]/wallet-collection/wallets";
import { shortenPublicKey } from "@/shared/utils";
import { AllowlistEntry } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Loader } from "../Loader";
import Pagination from "../Pagination";
import { Table } from "./Table";

export const WalletCollectionTable = ({
  projectSlug,
}: {
  projectSlug: string;
}) => {
  const [collectedWallets, setWallets] = useState<ExtendedAllowlistEntry[]>();
  const [total, setTotal] = useState<number>();
  const [page, setPage] = useState<number>(1);
  const [pageLength, setPageLength] = useState<number>(10);

  const { data: ret, isLoading } = useCollectedWallets({
    projectSlug,
    page,
    pageLength,
  });

  useEffect(() => {
    if (ret) {
      setWallets(ret.wallets);
      setTotal(ret.total);
    }
  }, [ret]);

  const handlePage = (page: number) => {
    setPage(page);
  };

  const handlePageLength = (pageLength: number) => {
    setPageLength(pageLength);
    setPage(1);
  };

  const cols = useMemo<ColumnDef<AllowlistEntry>[]>(
    () => [
      {
        header: "Wallet",
        cell: (row) =>
          row.renderValue()
            ? shortenPublicKey(row.renderValue() as string)
            : "",
        accessorKey: "walletAddress",
      },
      {
        header: "Atlas3 Username",
        cell: (row) => row.renderValue(),
        accessorKey: "user.name",
      },
      {
        header: "Submitted on",
        cell: (row) => row.renderValue(),
        accessorKey: "createdAt",
      },

      {
        header: "Owner",
        cell: (row) => {
          const owner = row.getValue() as string;
          if (!owner) return null;
          return <img src={owner} alt="" className="w-8 h-8 rounded-md" />;
        },
        accessorKey: "user.image",
      },
    ],
    []
  );

  if (isLoading) {
    return <Loader />;
  }

  if (!collectedWallets) {
    return <div>No wallets collected yet.</div>;
  }

  return (
    <>
      <Table
        data={collectedWallets}
        columns={cols}
        isLoading={false}
        pagination={
          <Pagination
            pageLength={pageLength}
            total={total}
            page={page}
            handlePage={handlePage}
            handlePageLength={handlePageLength}
          />
        }
      />
    </>
  );
};
