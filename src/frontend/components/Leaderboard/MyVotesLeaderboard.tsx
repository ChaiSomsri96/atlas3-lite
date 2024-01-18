import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useLeaderboardMyVotes } from "@/frontend/hooks/useLeaderboardMyVotes";
import { ExtendedProjectVoteEntry } from "@/frontend/hooks/useLeaderboardMyVotes";
import { Table } from "../Table/Table";

export const MyVotesLeaderboard = () => {
  const [votes, setVotes] = useState<ExtendedProjectVoteEntry[]>([]);

  const { data: ret, isLoading } = useLeaderboardMyVotes();

  useEffect(() => {
    if (ret) {
      setVotes(ret.votes);
    }
  }, [ret]);

  const cols = useMemo<ColumnDef<ExtendedProjectVoteEntry>[]>(
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
          const votes = col.getValue() as ExtendedProjectVoteEntry;

          return (
            <div className="flex py-2 rounded-2xl items-center">
              <div className="flex gap-2 items-center">
                <img
                  src={`${
                    votes.project.imageUrl ?? "/images/AvatarPlaceholder-1.png"
                  }`}
                  className="w-8 h-8 rounded-md"
                  alt={`${votes.project.name}`}
                />
                <span className="text-md font-semibold">{`${votes.project.name}`}</span>
              </div>
            </div>
          );
        },
        accessorKey: "id",
        accessorFn: (row) => row,
      },
      {
        header: "Votes",
        cell: (col) => {
          const votes = col.getValue() as ExtendedProjectVoteEntry;

          return <span>{`${votes.votes ?? "-"}`}</span>;
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <div>
        {votes && (
          <Table
            data={votes}
            columns={cols}
            isLoading={isLoading}
            pagination={null}
          />
        )}
      </div>
    </div>
  );
};
