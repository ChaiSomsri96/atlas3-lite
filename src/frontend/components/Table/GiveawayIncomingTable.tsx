import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { Dialog, Transition } from "@headlessui/react";
import {
  BlockchainNetwork,
  CollabType,
  GiveawayRule,
  GiveawayRuleType,
  GiveawayStatus,
  Project,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CloseSquare,
  Edit2,
  ExportSquare,
  ShieldCross,
  TickCircle,
} from "iconsax-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { SiTwitter } from "react-icons/si";
import { useHandleUpdateGiveawayState } from "@/frontend/handlers/useHandleUpdateGiveawayState";
import { useProjectGiveawayOffers } from "@/frontend/hooks/useProjectGiveawayOffers";
import {
  FilterOption,
  GiveawayStatusFilters,
  NetworkFilters,
  SortOption,
} from "@/shared/types";
import FilterButton from "../FilterButton";
import { Input, Label } from "@/styles/FormComponents";
import Link from "next/link";
import ReactTooltip from "react-tooltip";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { infinitePageLength, InfiniteTable } from "./InfiniteTable";
import { Loader } from "../Loader";
import SortButton from "../SortButton";

const FILTER_OPTIONS: FilterOption[] =
  GiveawayStatusFilters.concat(NetworkFilters);

const SORT_OPTIONS: SortOption[] = [
  {
    id: "createdAt_desc",
    name: "Created Date",
  },
  {
    id: "createdAt_asc",
    name: "Created Date",
  },
];
export const GiveawayIncomingTable = ({
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

  const [acceptSlug, setAcceptSlug] = useState<string>();
  const [acceptStatus, setAcceptStatus] = useState<CollabType | null>();
  const [isAcceptOpen, setAcceptOpen] = useState<boolean>(false);
  const [rules, setRules] = useState<GiveawayRule[]>([]);

  const [refuseSlug, setRefuseSlug] = useState<string>();
  const [isRefuseOpen, setRefuseOpen] = useState<boolean>(false);

  const [counterSlug, setCounterSlug] = useState<string>();
  const [counterSpots, setCounterSpots] = useState<number>();
  const [isCounterOpen, setCounterOpen] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("createdAt_desc"); // End Date as Descending

  const { data: ret, isLoading } = useProjectGiveawayOffers({
    projectSlug: project.slug,
    collabType,
    page,
    pageLength: infinitePageLength,
    filterOptions,
    search,
    sortOption,
  });

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
    setGiveaways(undefined);
  };

  useEffect(() => {
    if (ret) {
      if (giveaways && page > 1) {
        setGiveaways([...giveaways, ...ret.offers]);
      } else {
        setGiveaways(ret.offers);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  const handleRespondGiveawayOffer = useHandleUpdateGiveawayState();

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

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
    setGiveaways(undefined);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleAcceptOpen = (
    slug: string,
    type: CollabType | null,
    rules: GiveawayRule[]
  ) => {
    setAcceptOpen(true);
    setRules(rules);
    setAcceptSlug(slug);
    setAcceptStatus(type);
  };

  const handleRefuseOpen = (slug: string) => {
    setRefuseOpen(true);
    setRefuseSlug(slug);
  };

  const handleCounterOpen = (slug: string) => {
    setCounterOpen(true);
    setCounterSlug(slug);
  };

  const handleAccept = () => {
    if (!acceptSlug) return;

    console.log(acceptSlug);
    setAcceptOpen(false);

    handleRespondGiveawayOffer.mutate({
      projectSlug: project.slug,
      giveawaySlug: acceptSlug,
      status: GiveawayStatus.RUNNING,
      spots: 0,
      preventDuplicateIps: undefined,
    });
  };

  const handleRefuse = () => {
    setRefuseOpen(false);
    handleRespondGiveawayOffer.mutate({
      projectSlug: project.slug,
      giveawaySlug: refuseSlug ?? "",
      status: GiveawayStatus.COLLAB_REJECTED,
      spots: 0,
      preventDuplicateIps: undefined,
    });
  };

  const handleCounter = () => {
    setCounterOpen(false);
    handleRespondGiveawayOffer.mutate({
      projectSlug: project.slug,
      giveawaySlug: counterSlug ?? "",
      status: GiveawayStatus.RUNNING,
      spots: counterSpots ?? 0,
      preventDuplicateIps: undefined,
    });
  };

  type Props = {
    rules: GiveawayRule[];
  };

  const ReadOnlyForm: React.FC<Props> = ({ rules }) => {
    return (
      <div className="flex flex-col mt-2">
        <div className="mb-2 font-bold">
          The rules configured on this giveaway:
        </div>
        {rules.map((rule) => {
          switch (rule.type) {
            case GiveawayRuleType.TWITTER_FRIENDSHIP:
              return (
                <div key={rule.id}>
                  <div className="flex flex-col">
                    <span>
                      {rule.twitterFriendshipRule?.relationships
                        .map((r) => r.charAt(0) + r.slice(1).toLowerCase())
                        .join(", ")}{" "}
                      {rule.twitterFriendshipRule?.username}
                    </span>
                  </div>
                </div>
              );
            case GiveawayRuleType.TWITTER_TWEET:
              return (
                <div key={rule.id}>
                  {" "}
                  <div className="flex flex-col">
                    <span>
                      {rule.twitterTweetRule?.actions.join(", ")}{" "}
                      {rule.twitterTweetRule?.tweetId}
                    </span>
                  </div>
                </div>
              );
            case GiveawayRuleType.DISCORD_GUILD:
              return (
                <div key={rule.id}>
                  <div className="flex flex-col">
                    <span>Join {rule.discordGuildRule?.guildName} discord</span>
                  </div>
                </div>
              );
            case GiveawayRuleType.DISCORD_ROLE:
              return (
                <div key={rule.id}>
                  <div className="flex flex-col">
                    <span>
                      Have the following roles in{" "}
                      {rule.discordRoleRule?.guildName} server:{" "}
                      {rule.discordRoleRule?.roles
                        .map((x) => x.role.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const cols = useMemo<ColumnDef<ExtendedGiveaway>[]>(
    () => [
      {
        header: "Offer from",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <Link className="flex gap-2" href={`/project/${obj.project?.slug}`}>
              <img
                src={obj.project?.imageUrl ?? "/images/AvatarPlaceholder-1.png"}
                className="w-10 h-10 rounded-lg"
                alt=""
              />
              <div className="-mt-1">
                <h1 className="text-white text-xl font-semibold">
                  {obj.project.name.length > 15
                    ? obj.project.name.slice(0, 15) + "..."
                    : obj.project.name}{" "}
                  {obj.project.verified ? (
                    <span className="absolute">
                      <img
                        src="/images/verified.svg"
                        alt="Verified"
                        data-tip=""
                        data-for="verified"
                      />
                      <ReactTooltip
                        id="verified"
                        type="dark"
                        effect="solid"
                        getContent={() => {
                          return (
                            <div className="px-4 py-2 rounded-md">
                              <p className="text-grayc ">
                                This project has been verified by the Blocksmith
                                Labs team.
                              </p>
                            </div>
                          );
                        }}
                      />
                    </span>
                  ) : null}
                </h1>
                <span className="text-md text-neutral-400">
                  Created At:{" "}
                  {format(
                    Date.parse(obj.createdAt.toString()),
                    "dd EEE, hh:mm aa"
                  )}
                </span>
                {obj.owner && (
                  <div className="text-md text-neutral-400">
                    From: {obj.owner?.name}
                  </div>
                )}
                {obj.project?.twitterUsername && (
                  <a
                    className="text-primary-500 hover:underline"
                    href={`https://twitter.com/${obj?.project?.twitterUsername}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiTwitter className="h-5 w-5" />
                  </a>
                )}
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
              <div className="-mt-1 flex flex-col">
                <h1 className="text-white text-xl font-semibold">
                  {obj.name.length > 20
                    ? obj.name.substring(0, 20) + "..."
                    : obj.name}
                </h1>
                <span className="text-md text-neutral-400">
                  Live:{" "}
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
                  {obj.teamSpots && (
                    <div className="bg-primary-500 mt-2 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <span className="text-white">Team Spots</span>
                    </div>
                  )}
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
        header: "Duration (Hours)",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => row.collabDuration,
      },
      {
        header: "",
        cell: (col) => {
          const giveaway = col.getValue() as ExtendedGiveaway;

          if (giveaway.status === GiveawayStatus.COLLAB_PENDING) {
            return (
              <>
                <div className="flex gap-2">
                  <button
                    className={`bg-green-500 h-10 text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                    onClick={() =>
                      handleAcceptOpen(
                        giveaway.slug,
                        giveaway.collabType,
                        giveaway.rules
                      )
                    }
                  >
                    <div className="bg-transparent p-2 rounded-lg">
                      <TickCircle
                        className="h-5 w-5"
                        color="#33FF33"
                        variant="Bold"
                      />
                    </div>
                    <span>Accept</span>
                  </button>
                  <button
                    className={`text-white group h-10 flex w-full bg-red-500 items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                    onClick={() => handleRefuseOpen(giveaway.slug)}
                  >
                    <div className="bg-transparent p-2 rounded-lg">
                      <ShieldCross
                        className="h-5 w-5"
                        color="red"
                        variant="Bold"
                      />
                    </div>
                    <span>Refuse</span>
                  </button>
                </div>
                <div className="flex flex-row">
                  {giveaway.collabType === "RECEIVE_SPOTS" && (
                    <button
                      className={`text-white group h-10 flex w-1/2 mt-2 bg-orange-500 items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                      onClick={() => handleCounterOpen(giveaway.slug)}
                    >
                      <div className="bg-transparent p-2 rounded-lg">
                        <Edit2
                          className="h-5 w-5"
                          color="orange"
                          variant="Bold"
                        />
                      </div>
                      Counter
                    </button>
                  )}
                </div>
              </>
            );
          }

          if (giveaway.countered) {
            return (
              <>
                <div className="flex flex-row">
                  {giveaway.collabProject && (
                    <Link
                      href={`/project/${giveaway.collabProject.slug}/giveaway/${giveaway.slug}`}
                      target="_blank"
                      className="ml-2"
                    >
                      <button className="p-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500">
                        <ExportSquare size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </>
            );
          }

          if (giveaway.status !== GiveawayStatus.COLLAB_REJECTED) {
            return (
              <>
                <div className="flex flex-row">
                  {giveaway.collabProject && (
                    <Link
                      href={`/project/${giveaway.collabProject.slug}/giveaway/${giveaway.slug}`}
                      target="_blank"
                      className="ml-2"
                    >
                      <button className="p-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500">
                        <ExportSquare size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </>
            );
          }
        },
        accessorFn: (row) => row,
        accessorKey: "slug",
      },
    ],
    [giveaways]
  );

  return (
    <div>
      <div className="flex sm:flex-row flex-col gap-2 justify-between items-center">
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center sm:w-fit w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center justify-between sm:w-fit w-full">
          <span className="text-neutral-500">{total ?? 0} Offers sent</span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
            />
          </div>
          <SortButton
            sortOptions={SORT_OPTIONS}
            handleSort={handleSort}
            defaultSort={SORT_OPTIONS.find(
              (item) => item.id === "createdDate_desc"
            )}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-3 items-center">
          <span className="text-white">
            {collabType === "RECEIVE_SPOTS"
              ? "These are the incoming requests to RECEIVE allowlists spots from you."
              : "These are the incoming requests to GIVE allowlist spots to you"}{" "}
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
          isDropdownOpen={false}
          handleNext={handleNext}
        />
      )}

      <Transition appear show={isAcceptOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setAcceptOpen(false)}
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
                <Dialog.Panel className="w-full max-w-md max-h-lg transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Accept Collaboration?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setAcceptOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    {!project.discordGuild &&
                      acceptStatus === CollabType.RECEIVE_SPOTS && (
                        <p className="text-sm mt-4 font-bold text-red-500">
                          You do not have the Atlas3 bot installed in your
                          server, once this giveaway is accepted, your discord
                          server will not be informed. It is advised to add the
                          bot and setup a giveaway channel to get notified of
                          all giveaways!
                        </p>
                      )}
                    <ReadOnlyForm rules={rules} />
                    <p className="text-sm mt-4 font-bold text-white">
                      {/*Once accepted, this will create a draft giveaway in your
                      giveaways panel, you will need to verify all details and
                      then publish it for public. Are you sure you want to do
        that?*/}
                      Once accepted, this giveaway will go live instantly. Are
                      you sure you want to accept?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setAcceptOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleAccept}
                    >
                      Yes, accept collaboration
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isRefuseOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setRefuseOpen(false)}
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
                      Refuse Collaboration?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setRefuseOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-white">
                      Once refused, the action can not be undone. Are you sure
                      you want to refuse the collaboration?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setRefuseOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleRefuse}
                    >
                      Yes, refuse collaboration
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isCounterOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setCounterOpen(false)}
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
                      Counter Collaboration
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setCounterOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4">
                    <Label>New Spot Allocation</Label>
                    <Input
                      type="number"
                      onWheel={() => {
                        if (document.activeElement instanceof HTMLElement) {
                          document?.activeElement?.blur();
                        }
                      }}
                      id="counterSpots"
                      placeholder="Placeholder"
                      onChange={(e) => setCounterSpots(Number(e.target.value))}
                    />
                    <p className="text-sm text-white mt-4">
                      Once countered, this giveaway will go live with the value
                      you have input.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setCounterOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleCounter}
                    >
                      Counter Collaboration
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
