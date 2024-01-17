import {
  MeeListApplications,
  Project,
  ProjectApplicationSubmissions,
} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Clipboard, ShieldCross, TickCircle } from "iconsax-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader } from "../Loader";
import { useProjectPendingApplications } from "@/frontend/hooks/useProjectPendingApplications";
import { useHandleUpdateProjectApplication } from "@/frontend/handlers/useHandleUpdateProjectApplication";
import ApplicationAnswersSlideOver, {
  Answers,
} from "../ApplicationAnswersSlideOver";
import { InfiniteTable } from "./InfiniteTable";
import { HiSearch } from "react-icons/hi";
import { SortOption } from "@/shared/types";
import SortButton from "../SortButton";

export const ApplicationsTable = ({ project }: { project: Project }) => {
  const [applications, setApplications] =
    useState<ProjectApplicationSubmissions[]>();
  const [total, setTotal] = useState<number>();
  const [answers, setAnswers] = useState<Answers[]>();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("followers_desc"); // End Date as Descending

  const SORT_OPTIONS: SortOption[] = [
    {
      id: "followers_asc",
      name: "Followers",
    },
    {
      id: "followers_desc",
      name: "Followers",
    },
  ];

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
    setApplications(undefined);
  };

  const { data: ret, isLoading } = useProjectPendingApplications({
    projectSlug: project.slug,
    page,
    pageLength: 50,
    search,
    sortOption,
  });

  useEffect(() => {
    if (ret) {
      if (applications && page > 1) {
        setApplications([...applications, ...ret.applications]);
        const find = ret.applications.find(
          (x) => x.twitterUsername === "bzee01"
        );

        console.log(find);
      } else {
        console.log("nophere");
        setApplications(ret.applications as ProjectApplicationSubmissions[]);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  const handleNext = () => {
    setPage(page + 1);
  };

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (search != searchInput) {
        setSearch(searchInput);
        setPage(1);
        setApplications(undefined);
      }
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleUpdateApplication = useHandleUpdateProjectApplication();

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
              target="_blank"
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
      {
        header: "",
        cell: (col) => {
          const application = col.getValue() as MeeListApplications;

          if (application.status === "APPROVED") {
            return <div className="flex gap-2">approved</div>;
          }

          return (
            <div className="flex gap-2">
              <button
                className={`text-white group h-10 flex w-1/2 bg-primary-500 items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                onClick={() => {
                  setAnswers(application.answers);
                  setOpen(true);
                }}
              >
                <div className="bg-transparent p-2 rounded-lg">
                  <Clipboard className="h-5 w-5" color="white" variant="Bold" />
                </div>
                <span>View</span>
              </button>
              <button
                className={`bg-green-500 h-10 text-white group flex w-1/2 items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                onClick={async () => {
                  await handleUpdateApplication.mutateAsync({
                    projectSlug: project.slug,
                    id: application.id,
                    appStatus: "APPROVED",
                  });

                  setApplications((prev) => {
                    const newApps = prev?.filter(
                      (x) => x.id !== application.id
                    );
                    return newApps;
                  });
                }}
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
                className={`text-white group h-10 flex w-1/2 bg-red-500 items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                onClick={async () => {
                  await handleUpdateApplication.mutateAsync({
                    projectSlug: project.slug,
                    id: application.id,
                    appStatus: "REJECTED",
                  });

                  setApplications((prev) => {
                    const newApps = prev?.filter(
                      (x) => x.id !== application.id
                    );
                    return newApps;
                  });
                }}
              >
                <div className="bg-transparent p-2 rounded-lg">
                  <ShieldCross className="h-5 w-5" color="red" variant="Bold" />
                </div>
                <span>Refuse</span>
              </button>
            </div>
          );
        },
        accessorFn: (row) => row,
        accessorKey: "id",
      },
    ],
    [applications]
  );

  return (
    <div>
      {!applications && isLoading && <Loader />}
      <div className="flex gap-3 items-center justify-between sm:w-fit w-full">
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center sm:w-fit w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Applications"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <span className="text-neutral-500">{total ?? 0} pending</span>
        <SortButton
          sortOptions={SORT_OPTIONS}
          handleSort={handleSort}
          defaultSort={SORT_OPTIONS.find(
            (item) => item.id === "followers_desc"
          )}
        />
      </div>
      {applications && (
        <InfiniteTable
          data={applications}
          columns={cols}
          total={total}
          isLoading={isLoading}
          isDropdownOpen={false}
          handleNext={handleNext}
        />
      )}
      <ApplicationAnswersSlideOver
        open={open}
        setOpen={setOpen}
        answers={answers}
      />
    </div>
  );
};
