import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiDiscord, SiTwitter } from "react-icons/si";
import { PointsBox } from "./PointsBox";
import { useMarketplaceListings } from "@/frontend/hooks/useMarketplaceListings";
import { MarketplaceRecordData } from "@/pages/api/me/marketplace/listings";
import { PrimaryButton } from "@/styles/BaseComponents";
import { RxArrowLeft, RxPlus } from "react-icons/rx";
import { BuyModal } from "./BuyModal";
import { useSession } from "next-auth/react";
import { DelistModal } from "./DelistModal";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";
import { useMarketplaceProjectListings } from "@/frontend/hooks/useMarketplaceProjectListings";
import { Loader } from "../Loader";
import { ProjectListingCard } from "./ProjectListingCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { MarketplaceProjectListingData } from "@/pages/api/me/marketplace/projects-listings";
import { InfiniteTable } from "../Table/InfiniteTable";

type Props = {
  search: string;
};

export const Listings = ({ search }: Props) => {
  const { data: session } = useSession();
  const [buyRecord, setBuyRecord] = useState<MarketplaceRecordData>();
  const [isBuyOpen, setBuyOpen] = useState<boolean>(false);
  const [isDelistOpen, setDelistOpen] = useState<boolean>(false);
  const [delistRecord, setDelistRecord] = useState<MarketplaceRecordData>();
  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const [points, setPoints] = useState<number>();

  const pageLength = 12;
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearch] = useState<string>(search);
  const [allowlistTradingEnabled, setAllowlistTradingEnabled] =
    useState<boolean>(false);

  const [listingPage, setListingPage] = useState<number>(1);
  const [listingTotal, setListingTotal] = useState<number>();

  useEffect(() => {
    if (userPoints) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

  const handleBuyOpen = (record: MarketplaceRecordData) => {
    setBuyRecord(record);
    setBuyOpen(true);
  };

  const handleDelistOpen = (record: MarketplaceRecordData) => {
    setDelistRecord(record);
    setDelistOpen(true);
  };

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const {
    data: ret,
    isLoading,
    refetch,
  } = useMarketplaceListings({
    activeProjectId,
    page: listingPage,
    pageLength,
    search,
  });

  const [listings, setListings] = useState<MarketplaceRecordData[]>();

  useEffect(() => {
    if (ret) {
      if (listings && listingPage > 1) {
        const filteredListings = ret.records.filter(
          (record) => !listings.find((p) => p.id === record.id)
        );

        setListings([...listings, ...filteredListings]);
      } else {
        setListings(ret.records);
      }

      setListingTotal(ret.total);
      setAllowlistTradingEnabled(ret.allowlistTradingEnabled);
    }
  }, [ret]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeProjectId !== "") {
        refetch();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRefetch = () => {
    refetchPoints();
    refetch();
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleListingNext = () => {
    setListingPage(listingPage + 1);
  };

  const { data: projectListingsData } = useMarketplaceProjectListings({
    page,
    pageLength,
    search,
  });

  const [projectListings, setProjectListings] =
    useState<MarketplaceProjectListingData[]>();

  useEffect(() => {
    if (projectListingsData) {
      if (projectListings && page > 1) {
        const filteredProjects = projectListingsData.records.filter(
          (record) =>
            !projectListings.find((p) => p.project.id === record.project.id)
        );

        setProjectListings([...projectListings, ...filteredProjects]);
      } else {
        setProjectListings(projectListingsData.records);
      }

      setTotal(projectListingsData.total);
    }
  }, [projectListingsData]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setProjectListings(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const cols = useMemo<ColumnDef<MarketplaceRecordData>[]>(
    () => [
      {
        header: "Project",
        cell: (col) => {
          const record = col.getValue() as MarketplaceRecordData;

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
          const record = col.getValue() as MarketplaceRecordData;
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
          const record = col.getValue() as MarketplaceRecordData;
          return (
            <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${
              record.allowlistEntry?.role
                ? record.allowlistEntry.role.name
                : "No Role"
            }`}</h1>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Discord",
        cell: (col) => {
          const record = col.getValue() as MarketplaceRecordData;
          return (
            <Link href={`${record.project.discordInviteUrl}`} target="_blank">
              <SiDiscord className="h-4 w-4 text-white" />
            </Link>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Twitter",
        cell: (col) => {
          const record = col.getValue() as MarketplaceRecordData;
          return (
            <Link
              href={`https://twitter.com/${record.project.twitterUsername}`}
              target="_blank"
            >
              <SiTwitter className="h-4 w-4 text-white" />
            </Link>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const record = col.getValue() as MarketplaceRecordData;

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
            if (record.userEntry) {
              return (
                <button
                  type="button"
                  key={`pre-vote-${record.id}`}
                  className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-success-500"
                >
                  <span>You already have allowlist.</span>
                </button>
              );
            } else {
              return (
                <button
                  type="button"
                  key={`pre-vote-${record.id}`}
                  className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500"
                  onClick={() => handleBuyOpen(record)}
                >
                  <span>Buy</span>
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
      <PointsBox points={points} refetch={refetchPoints} screen="listings" />

      <div className="my-5 flex flex-row gap-2">
        {activeProjectId !== "" && (
          <PrimaryButton
            onClick={() => {
              setActiveProjectId("");
              setListingPage(1);
              setListings(undefined);
            }}
          >
            <div className="flex items-center">
              <RxArrowLeft className="h-5 w-5 mr-2" />
              Back to project overview
            </div>
          </PrimaryButton>
        )}
        <PrimaryButton>
          <Link href={"/marketplace/new-listing"}>
            <div className="flex items-center">
              <RxPlus className="h-5 w-5 mr-2" />
              New Listing
            </div>
          </Link>
        </PrimaryButton>
      </div>

      {false ? (
        <Loader />
      ) : (
        projectListings &&
        activeProjectId === "" && (
          <InfiniteScroll
            dataLength={projectListings.length}
            next={handleNext}
            hasMore={projectListings.length < (total ?? 0)}
            loader={<Loader />}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {projectListings?.map((project) => (
                <ProjectListingCard
                  key={project.project.id}
                  record={project}
                  setActiveProjectId={setActiveProjectId}
                />
              ))}
            </div>
          </InfiniteScroll>
        )
      )}

      {isLoading && listingPage === 1 ? (
        <Loader />
      ) : (
        <>
          {!allowlistTradingEnabled && (
            <p>
              This project has disabled allowlist trading. Please check back
              later.
            </p>
          )}
          {listings && allowlistTradingEnabled && (
            <InfiniteTable
              data={listings}
              columns={cols}
              total={listingTotal}
              isLoading={isLoading}
              handleNext={handleListingNext}
              isDropdownOpen={false}
            />
          )}
        </>
      )}

      <BuyModal
        recordId={buyRecord?.id}
        recordName={buyRecord?.project?.name}
        recordPointCost={(buyRecord?.pointCost ?? 0) / 1000}
        roleName={buyRecord?.allowlistEntry?.role?.name}
        discordInvite={buyRecord?.project?.discordInviteUrl ?? undefined}
        isOpen={isBuyOpen}
        setBuyOpen={setBuyOpen}
        refetch={handleRefetch}
        myPoints={(points ?? 0) / 1000}
      />
      <DelistModal
        recordId={delistRecord?.id}
        recordName={delistRecord?.project?.name}
        isOpen={isDelistOpen}
        setDelistOpen={setDelistOpen}
        refetch={refetch}
      />
    </div>
  );
};
