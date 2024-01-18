import { ColumnDef } from "@tanstack/react-table";
import { InfoCircle } from "iconsax-react";
import { useEffect, useMemo, useState } from "react";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { useLeaderboardProjects } from "@/frontend/hooks/useLeaderboardProjects";
import Link from "next/link";
import { SiDiscord, SiTwitter } from "react-icons/si";
import { LeaderboardTable } from "./LeaderboardTable";
import { BlockchainNetwork, Project } from "@prisma/client";
import { VoteModal } from "./VoteModal";

type Props = {
  search: string;
};

export const PreMintLeaderboard = ({ search }: Props) => {
  const [projects, setProjects] = useState<Project[]>();
  const [voteId, setVoteId] = useState<string>();
  const [voteName, setVoteName] = useState<string>();
  const [isVoteOpen, setVoteOpen] = useState<boolean>(false);

  const {
    data: ret,
    isLoading,
    refetch,
  } = useLeaderboardProjects({
    phase: "PREMINT",
  });

  useEffect(() => {
    if (ret) {
      setProjects(ret.projects);
    }
  }, [ret]);

  const filteredProjects = useMemo(() => {
    if (search && ret) {
      console.log(search);

      return ret.projects.filter((project) => {
        return project.name.toLowerCase().includes(search.toLowerCase());
      });
    }
    return ret?.projects || [];
  }, [search, ret]);

  useEffect(() => {
    setProjects(filteredProjects);
  }, [filteredProjects]);

  const handleVoteOpen = (projectId: string, name: string) => {
    setVoteName(name);
    setVoteId(projectId);
    setVoteOpen(true);

    setTimeout(() => {
      setVoteOpen(false);
    }, 500);
  };

  const cols = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header() {
          return (
            <div className="flex">
              <span className="w-16">Rank</span>
              <span>Project</span>
            </div>
          );
        },
        cell: (col) => {
          const rowIdx = col.row.index;
          const project = col.getValue() as Project;
          //const ranks = [RankType.Same, RankType.Up, RankType.Down];
          //const rank_type = ranks[Math.floor(Math.random() * 3)];

          let bgColor = "";
          let markerColor = "";
          if (rowIdx == 0) {
            bgColor =
              "linear-gradient(90deg, rgba(185, 168, 114, 0.5) 0%, rgba(185, 168, 114, 0) 100%)";
            markerColor = "#B9A872";
          } else if (rowIdx == 1) {
            bgColor =
              "linear-gradient(90deg, rgba(159, 162, 165, 0.5) 0%, rgba(159, 162, 165, 0) 100%)";
            markerColor = "#9FA2A5";
          } else if (rowIdx == 2) {
            bgColor =
              "linear-gradient(90deg, rgba(160, 129, 113, 0.5) 0%, rgba(160, 129, 113, 0) 100%)";
            markerColor = "#A08171";
          }

          return (
            <Link
              href={`/project/${project.slug}`}
              target="_blank"
              className="flex py-2 rounded-2xl items-center"
              style={{
                background: bgColor,
              }}
            >
              <div
                className="w-[2px] h-6 ml-[1px] mr-6"
                style={{
                  backgroundColor: markerColor,
                }}
              ></div>
              <div className="flex gap-2 items-center w-16">
                <span className="text-md font-semibold">{rowIdx + 1}</span>
              </div>
              <div className="flex gap-2 items-center">
                <img
                  src={`${
                    project.imageUrl ?? "/images/AvatarPlaceholder-1.png"
                  }`}
                  className="w-8 h-8 rounded-md"
                  alt={`${project.name}`}
                />
                <span className="text-md font-semibold">{`${project.name}`}</span>
              </div>
            </Link>
          );
        },
        accessorKey: "id",
        accessorFn: (row) => row,
      },
      {
        header: "Twitter",
        cell: (col) => (
          <Link href={`https://twitter.com/${col.getValue()}`} target="_blank">
            <SiTwitter className="h-4 w-4 text-white" />
          </Link>
        ),
        accessorKey: "twitterUsername",
      },
      {
        header: "Discord",
        cell: (col) => (
          <Link href={`${col.getValue()}`} target="_blank">
            <SiDiscord className="h-4 w-4 text-white" />
          </Link>
        ),
        accessorKey: "discordInviteUrl",
      },
      {
        header: "Description",
        cell: (col) => (
          <h1 className="text-md text-white whitespace-pre-wrap break-words overflow-hidden line-clamp-2">{`${col.getValue()}`}</h1>
        ),
        accessorKey: "description",
      },
      {
        header: "Chain",
        cell: (col) => {
          const network = col.getValue() as BlockchainNetwork;
          return NetworkIcon[network];
        },
        accessorKey: "network",
      },
      {
        header: "Mint price",
        cell: (col) => {
          const project = col.getValue() as Project;
          if (project.mintPrice) {
            return (
              <p className="flex gap-1">
                {project.mintPrice} {NetworkIcon[project.network]}
              </p>
            );
          } else {
            return <span>TBD</span>;
          }
        },
        accessorFn: (row) => row,
      },
      {
        header: "Supply",
        cell: (col) => <span>{`${col.getValue() ?? "TBD"}`}</span>,
        accessorKey: "supply",
      },
      {
        header: "Votes",
        cell: (col) => <span>{`${col.getValue() ?? "-"}`}</span>,
        accessorKey: "votes",
      },
      {
        header: "",
        id: "vote",
        cell: (col) => {
          const project = col.getValue() as Project;
          return (
            <button
              type="button"
              key={`pre-vote-${project.slug}`}
              className="border border-primary-500 rounded-2xl px-3 py-1 text-white text-md font-semibold flex gap-0.5 items-center w-fit"
              onClick={() => handleVoteOpen(project.id, project.name)}
            >
              <span>Vote | 1</span>
              <img
                className="h-4 w-auto"
                src="/images/icon-forge.png"
                alt="FORGE"
              />
            </button>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <div className="bg-primary-900 px-6 py-4 flex flex-col-reverse md:flex-row gap-4 rounded-xl mt-6">
        <InfoCircle className="w-6 h-6 md:self-start" />
        <div className="flex flex-col">
          <p className="">
            - Votes for pre-mint projects are reset at the end of each month.
          </p>
          <p className="">
            - The project in 1st place will automatically be featured on the
            landing page.
          </p>
          <p className="">
            - The top 3 projects will get a badge on their project to signal
            that they are trending.
          </p>
          <p className="">
            - Projects can give allowlist to users who vote for them on their
            creator page.
          </p>
        </div>
        <div className="flex flex-col mb-4 md:mb-0 md:ml-auto">
          <Link
            href="https://jup.ag/swap/SOL-FORGE"
            target="_blank"
            className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500 w-full md:w-auto justify-center md:justify-start flex items-center"
          >
            Buy $FORGE
          </Link>
        </div>
      </div>

      <div>
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
      )}
    </div>
  );
};
