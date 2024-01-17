import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Loader } from "../Loader";
import { infinitePageLength, InfiniteTable } from "./InfiniteTable";
import {
  ProjectRanking,
  useProjectRankings,
} from "@/frontend/hooks/useProjectRankings";
import { useHandleRankingsAssignAllowlist } from "@/frontend/handlers/useHandleRankingsAssignAllowlist";
import { ExtendedProject } from "@/pages/api/creator/owned-projects";

export const RankingsTable = ({ project }: { project: ExtendedProject }) => {
  const [rankings, setRankings] = useState<ProjectRanking[]>();
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>();
  const assignAllowlist = useHandleRankingsAssignAllowlist();

  const { data: ret, isLoading } = useProjectRankings({
    projectSlug: project.slug,
    page,
    pageLength: infinitePageLength,
  });

  useEffect(() => {
    if (ret) {
      if (rankings && page > 1) {
        setRankings([...rankings, ...ret.rankings]);
      } else {
        setRankings(ret.rankings);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleAssignAllowlist = async (userId: string) => {
    await assignAllowlist.mutateAsync({
      userId,
      projectSlug: project.slug,
    });
  };

  const cols = useMemo<ColumnDef<ProjectRanking>[]>(
    () => [
      {
        header: "User",
        cell: (col) => {
          const user = col.getValue() as User;
          return (
            <div className="flex flex-grow items-center gap-2 p-4">
              <img
                className="w-8 h-8 rounded-lg"
                src={user.image ?? "/images/AvatarPlaceholder-1.png"}
                alt={user.name}
              />
              <p>{user.name}</p>
            </div>
          );
        },
        accessorFn: (row) => row.user,
      },
      {
        header: "Vote count",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorKey: "votes",
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const projectRanking = col.getValue() as ProjectRanking;

          if (project.phase === "PREMINT") {
            if (projectRanking.entry) {
              return (
                <button className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-success-500">
                  Obtained Allowlist
                </button>
              );
            } else {
              return (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-white transition-colors duration-150 border border-transparent rounded-md bg-primary-500"
                    onClick={() => handleAssignAllowlist(projectRanking.userId)}
                  >
                    Assign Allowlist
                  </button>
                </div>
              );
            }
          }
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div>
      {!rankings && isLoading && <Loader />}

      {rankings && (
        <InfiniteTable
          data={rankings}
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
