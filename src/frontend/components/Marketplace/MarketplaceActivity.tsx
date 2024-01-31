import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { PointsBox } from "./PointsBox";
import { useSession } from "next-auth/react";
import { useMarketplaceActivity } from "@/frontend/hooks/useMarketplaceActivity";
import { MarketplaceActivityData } from "@/pages/api/me/marketplace/activity";
import { MarketplaceActionType, TradeType } from "@prisma/client";
import { formatDistance } from "date-fns";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";
import { InfiniteTable } from "../Table/InfiniteTable";

type Props = {
  search: string;
};

export const MarketplaceActivity = ({ search }: Props) => {
  const [activity, setActivity] = useState<MarketplaceActivityData[]>();
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>();

  const { data: session } = useSession();
  const { data: ret, isLoading } = useMarketplaceActivity({
    page,
    pageLength: 20,
    search,
  });

  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const [points, setPoints] = useState<number>();

  const [searchInput, setSearch] = useState<string>(search);

  useEffect(() => {
    if (userPoints && userPoints.points) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

  useEffect(() => {
    if (ret) {
      if (activity && page > 1) {
        setActivity([...activity, ...ret.records]);
      } else {
        setActivity(ret.records);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setActivity(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleNext = () => {
    console.log("here");
    setPage(page + 1);
  };

  console.log(total);

  const cols = useMemo<ColumnDef<MarketplaceActivityData>[]>(
    () => [
      {
        header: "Type",
        cell: (col) => {
          const record = col.getValue() as MarketplaceActivityData;
          if (
            record.marketplaceRecord.tradeType === TradeType.SELL &&
            record.action === MarketplaceActionType.LIST
          ) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
                Listing Created
              </h1>
            );
          }
          if (
            record.marketplaceRecord.tradeType === TradeType.BUY &&
            record.action === MarketplaceActionType.LIST
          ) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
                Buy Order Created
              </h1>
            );
          }

          if (
            record.marketplaceRecord.tradeType === TradeType.SELL &&
            record.action === MarketplaceActionType.DELIST
          ) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
                Listing Cancelled
              </h1>
            );
          }

          if (
            record.marketplaceRecord.tradeType === TradeType.BUY &&
            record.action === MarketplaceActionType.DELIST
          ) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
                Buy Order Cancelled
              </h1>
            );
          }

          if (record.action === MarketplaceActionType.SALE) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
                Sale
              </h1>
            );
          }

          return (
            <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">
              {record.action === MarketplaceActionType.BUY ? "Buy" : "Sell"}
            </h1>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Project",
        cell: (col) => {
          const record = col.getValue() as MarketplaceActivityData;

          return (
            <div className="flex gap-2 items-center">
              <img
                src={`${
                  record.marketplaceRecord.project.imageUrl ??
                  "/images/AvatarPlaceholder-1.png"
                }`}
                className="w-8 h-8 rounded-md"
                alt={`${record.marketplaceRecord.project.name}`}
              />
              <span className="text-md font-semibold">{`${record.marketplaceRecord.project.name}`}</span>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      /* {
        header: "Discord Role",
        cell: (col) => {
          const record = col.getValue() as MarketplaceActivityData;

          if (record.marketplaceRecord.tradeType === TradeType.SELL) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${
                record.marketplaceRecord.allowlistEntry?.role
                  ? record.marketplaceRecord.allowlistEntry.role.name
                  : "No Role"
              }`}</h1>
            );
          }

          if (record.marketplaceRecord.tradeType === TradeType.BUY) {
            return (
              <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${
                record.marketplaceRecord.role
                  ? record.marketplaceRecord.role.name
                  : "No Role"
              }`}</h1>
            );
          }
        },
        accessorFn: (row) => row,
      },*/
      {
        header: "Price",
        cell: (col) => {
          const record = col.getValue() as MarketplaceActivityData;
          return (
            <div className="flex items-center">
              {" "}
              {/* Added flex container */}
              <h1 className="text-md text-white">
                {`${record.marketplaceRecord.pointCost / 1000}`}
              </h1>
              <img
                src="/images/Atlas3Points.png"
                className="w-3 h-3 ml-1"
                alt="Verified"
                data-tip=""
                data-for="verified"
              />
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Time",
        cell: (col) => {
          const record = col.getValue() as MarketplaceActivityData;
          return (
            <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${formatDistance(
              new Date(record.createdAt),
              new Date()
            )} ago`}</h1>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    [session]
  );

  return (
    <div className="w-full">
      <PointsBox points={points} refetch={refetchPoints} screen="activity" />

      <div className="my-5 flex justify-end"></div>
      {activity && (
        <InfiniteTable
          data={activity}
          columns={cols}
          total={total}
          isLoading={isLoading}
          handleNext={handleNext}
          isDropdownOpen={false}
        />
      )}
    </div>
  );
};
