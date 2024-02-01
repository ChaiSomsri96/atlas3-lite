import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PointsBox } from "./PointsBox";
import { PrimaryButton } from "@/styles/BaseComponents";
import { RxPlus } from "react-icons/rx";
import { Table } from "../Table/Table";
import {
  MarketplaceBuyRecordData,
  useMarketplaceBuyOrders,
} from "@/frontend/hooks/useMarketplaceBuyOrders";
import { useSession } from "next-auth/react";
import { DelistModal } from "./DelistModal";
import { SellModal } from "./SellModal";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";

type Props = {
  search: string;
};

export const BuyOrders = ({ search }: Props) => {
  const [listings, setListings] = useState<MarketplaceBuyRecordData[]>();
  const [sellRecord, setSellRecord] = useState<MarketplaceBuyRecordData>();
  const [isSellOpen, setSellOpen] = useState<boolean>(false);
  const [isDelistOpen, setDelistOpen] = useState<boolean>(false);
  const [delistRecord, setDelistRecord] = useState<MarketplaceBuyRecordData>();

  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const [points, setPoints] = useState<number>();

  useEffect(() => {
    if (userPoints && userPoints.points) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

  /*const [voteId, setVoteId] = useState<string>();
  const [voteName, setVoteName] = useState<string>();
  const [isVoteOpen, setVoteOpen] = useState<boolean>(false);*/

  const { data: session } = useSession();
  const { data: ret, isLoading, refetch } = useMarketplaceBuyOrders();

  const handleRefetch = () => {
    refetchPoints();
    refetch();
  };

  const handleDelistOpen = (record: MarketplaceBuyRecordData) => {
    setDelistRecord(record);
    setDelistOpen(true);
  };

  const handleSellOpen = (record: MarketplaceBuyRecordData) => {
    setSellRecord(record);
    setSellOpen(true);
  };

  const filteredListings = useMemo(() => {
    if (search && ret) {
      return ret.records.filter((record) => {
        return record.project.name.toLowerCase().includes(search.toLowerCase());
      });
    }
    return ret?.records || [];
  }, [search, ret]);

  useEffect(() => {
    setListings(filteredListings);
  }, [filteredListings]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  /* const handleVoteOpen = (projectId: string, name: string) => {
    setVoteName(name);
    setVoteId(projectId);
    setVoteOpen(true);

    setTimeout(() => {
      setVoteOpen(false);
    }, 500);
  };*/

  const cols = useMemo<ColumnDef<MarketplaceBuyRecordData>[]>(
    () => [
      {
        header: "Project",
        cell: (col) => {
          const record = col.getValue() as MarketplaceBuyRecordData;

          return (
            <div className="flex gap-2 items-center">
              <img
                src={`${
                  record.project.imageUrl ?? "/images/AvatarPlaceholder-1.png"
                }`}
                className="w-8 h-8 rounded-md"
                alt={`${record.project.name}`}
              />
              <span className="text-md font-semibold">{`${record.project.name}`}</span>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Price",
        cell: (col) => {
          const record = col.getValue() as MarketplaceBuyRecordData;
          return (
            <div className="flex items-center">
              {" "}
              {/* Added flex container */}
              <h1 className="text-md text-white">
                {`${record.pointCost / 1000}`}
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
        header: "Discord Role",
        cell: (col) => {
          const record = col.getValue() as MarketplaceBuyRecordData;
          return (
            <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${
              record.role ? record.role.name : "No Role"
            }`}</h1>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const record = col.getValue() as MarketplaceBuyRecordData;

          if (record.createdByUserId === session?.user?.id) {
            return (
              <>
                {session && (
                  <button
                    type="button"
                    key={`pre-vote-${record.id}`}
                    className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-error-500"
                    onClick={() => handleDelistOpen(record)}
                  >
                    <span>Delist</span>
                  </button>
                )}
              </>
            );
          } else {
            if (record.entry) {
              return (
                <button
                  type="button"
                  key={`pre-vote-${record.id}`}
                  className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500"
                  onClick={() => handleSellOpen(record)}
                >
                  <span>Sell</span>
                </button>
              );
            } else {
              return (
                <button
                  type="button"
                  key={`pre-vote-${record.id}`}
                  className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-error-500"
                >
                  <span>You do not have allowlist for this role</span>
                </button>
              );
            }
          }
        },

        accessorFn: (row) => row,
      },
    ],
    [session]
  );

  return (
    <div className="w-full">
      <PointsBox points={points} refetch={refetchPoints} screen="buys" />

      <div className="my-5">
        <PrimaryButton>
          <Link href={"/marketplace/new-buy-order"}>
            <div className="flex items-center">
              <RxPlus className="h-5 w-5 mr-2" />
              New Buy Order
            </div>
          </Link>
        </PrimaryButton>
      </div>
      <Table
        data={listings ? listings : []}
        columns={cols}
        isLoading={isLoading}
        pagination={null}
      />
      <SellModal
        recordId={sellRecord?.id}
        recordName={sellRecord?.project?.name}
        recordPointCost={(sellRecord?.pointCost ?? 0) / 1000}
        isOpen={isSellOpen}
        setBuyOpen={setSellOpen}
        refetch={handleRefetch}
      />
      <DelistModal
        recordId={delistRecord?.id}
        recordName={delistRecord?.project?.name}
        isOpen={isDelistOpen}
        setDelistOpen={setDelistOpen}
        refetch={refetch}
      />
      {/*<div>
        {projects && (
          <LeaderboardTable
            data={projects}
            columns={cols}
            isLoading={isLoading}
            pagination={null}
          />
        )}
      </div>

      {voteId && voteName && (
        <VoteModal
          projectId={voteId}
          name={voteName}
          isOpen={isVoteOpen}
          refetch={refetch}
        />
      )}*/}
    </div>
  );
};
