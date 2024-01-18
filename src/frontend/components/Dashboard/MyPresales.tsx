import { usePresales } from "@/frontend/hooks/usePresales";
import { UserPresaleEntry } from "@/pages/api/me/joined-presales";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Loader } from "../Loader";
import { Table } from "../Table/Table";
import { format } from "date-fns";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { shortenPublicKey } from "@/shared/utils";
import { PointsBox } from "../Marketplace/PointsBox";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";

export default function MyPresales() {
  const [projects, setProjects] = useState<UserPresaleEntry[]>();

  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const [points, setPoints] = useState<number>();

  useEffect(() => {
    if (userPoints && userPoints.points) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

  const { data: ret, isLoading } = usePresales();

  useEffect(() => {
    if (ret) {
      setProjects(ret.entries);
    }
  }, [ret]);

  const cols = useMemo<ColumnDef<UserPresaleEntry>[]>(
    () => [
      {
        header() {
          return (
            <div className="flex">
              <span>Project</span>
            </div>
          );
        },
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return (
            <div className="flex py-2 rounded-2xl items-center">
              <div className="flex gap-2 items-center">
                <img
                  src={`${
                    entry.presale.project.imageUrl ??
                    "/images/AvatarPlaceholder-1.png"
                  }`}
                  className="w-8 h-8 rounded-md"
                  alt={`${entry.presale.project.name}`}
                />
                <span className="text-md font-semibold">{`${entry.presale.project.name}`}</span>
              </div>
            </div>
          );
        },
        accessorKey: "id",
        accessorFn: (row) => row,
      },
      {
        header: "Chain",
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return <span>{NetworkIcon[entry.presale.project.network]}</span>;
        },
        accessorFn: (row) => row,
      },
      {
        header: "Allocation",
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return <span>{`${entry.entryAmount}`}</span>;
        },
        accessorFn: (row) => row,
      },
      {
        header: "Wallet",
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return <span>{`${shortenPublicKey(entry.walletAddress)}`}</span>;
        },
        accessorFn: (row) => row,
      },
      {
        header: "Total Spent",
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return (
            <span>
              {`${(entry.entryAmount * entry.presale.pointsCost) / 1000}`}
              <img
                src="/images/Atlas3Points.png"
                className="w-5 h-5 mr-2 inline ml-1"
                alt="Points"
              />
            </span>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Date Purchased",
        cell: (col) => {
          const entry = col.getValue() as UserPresaleEntry;

          return (
            <span>{`${format(
              Date.parse(entry.createdAt.toString()),
              "dd EEE, hh:mm aa"
            )}`}</span>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex gap-2 items-center justify-end -mt-12">
        {
          <p className="mr-2 text-sm text-gray-400 hidden sm:block">
            {projects ? projects.length : "-"} Presales entered
          </p>
        }
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        projects && (
          <>

            <div className="flex flex-col z-10">
            <PointsBox
              points={points}
              refetch={refetchPoints}
              screen="presales"
            />
              {projects && (
                <Table
                  data={projects}
                  columns={cols}
                  isLoading={isLoading}
                  pagination={null}
                />
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
