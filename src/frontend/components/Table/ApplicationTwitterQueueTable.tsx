import {
  MeeListApplications,
  Project,
  ProjectApplicationSubmissions,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader } from "../Loader";
import { Table } from "./Table";
import { useProjectPendingApplicationsQueue } from "@/frontend/hooks/useProjectPendingApplicationsQueue";

export const ApplicationTwitterQueueTable = ({
  project,
}: {
  project: Project;
}) => {
  const [applications, setApplications] =
    useState<ProjectApplicationSubmissions[]>();
  const [total, setTotal] = useState<number>();

  const { data: ret, isLoading } = useProjectPendingApplicationsQueue({
    projectSlug: project.slug,
  });

  useEffect(() => {
    if (ret) {
      setApplications(ret.applications as ProjectApplicationSubmissions[]);
      setTotal(ret.total);
    }
  }, [ret]);

  const cols = useMemo<ColumnDef<MeeListApplications>[]>(
    () => [
      {
        header: "Username",
        cell: (col) => {
          const obj = col.getValue() as MeeListApplications;
          return (
            <Link
              className="flex gap-2"
              href={`https://twitter.com/${obj?.twitterUsername}`}
            >
              <img
                src={obj.twitterImageUrl ?? "/images/AvatarPlaceholder-1.png"}
                className="w-10 h-10 rounded-lg"
                alt=""
              />
              <div className="-mt-1">
                <h1 className="text-white text-xl font-semibold">
                  {obj.twitterUsername}
                </h1>
                <span className="text-md text-neutral-400">
                  Created At:{" "}
                  {format(
                    Date.parse(obj.createdAt.toString()),
                    "dd EEE, hh:mm aa"
                  )}
                </span>
              </div>
            </Link>
          );
        },
        accessorFn: (row) => row,
      },

      {
        header: "Followers",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => row.followers ?? 0,
      },
    ],
    [applications]
  );

  return (
    <div>
      {!applications && isLoading && <Loader />}
      <div className="flex gap-3 items-center justify-between sm:w-fit w-full">
        <span className="text-neutral-500">{total ?? 0} pending</span>
      </div>
      {applications && (
        <Table
          data={applications}
          columns={cols}
          isLoading={isLoading}
          pagination={null}
        />
      )}
    </div>
  );
};
