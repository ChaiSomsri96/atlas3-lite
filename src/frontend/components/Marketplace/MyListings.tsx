import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { PointsBox } from "./PointsBox";
import { Table } from "../Table/Table";
import { MarketplaceBuyRecordData } from "@/frontend/hooks/useMarketplaceBuyOrders";
import { useSession } from "next-auth/react";
import { DelistModal } from "./DelistModal";
import { MarketplaceMyListingData } from "@/pages/api/me/marketplace/my-listings";
import { useMarketplaceMyListings } from "@/frontend/hooks/useMarketplaceMyListings";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";

type Props = {
  search: string;
};

export const MyListings = ({ search }: Props) => {
  const [listings, setListings] = useState<MarketplaceMyListingData[]>();
  const [isDelistOpen, setDelistOpen] = useState<boolean>(false);
  const [delistRecord, setDelistRecord] = useState<MarketplaceBuyRecordData>();

  const { data: session } = useSession();
  const { data: ret, isLoading, refetch } = useMarketplaceMyListings();

  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const [points, setPoints] = useState<number>();

  useEffect(() => {
    if (userPoints && userPoints.points) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

  const handleDelistOpen = (record: MarketplaceBuyRecordData) => {
    setDelistRecord(record);
    setDelistOpen(true);
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

  const cols = useMemo<ColumnDef<MarketplaceMyListingData>[]>(
    () => [
      {
        header: "Project",
        cell: (col) => {
          const record = col.getValue() as MarketplaceMyListingData;

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
          }
        },

        accessorFn: (row) => row,
      },
    ],
    [session]
  );

  return (
    <div className="w-full">
      <PointsBox points={points} refetch={refetchPoints} screen="mylistings" />

      <Table
        data={listings ? listings : []}
        columns={cols}
        isLoading={isLoading}
        pagination={null}
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
