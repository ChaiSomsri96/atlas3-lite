import { useHandleVerifyProject } from "@/frontend/handlers/useHandleVerifyProject";
import { useAdminProjects } from "@/frontend/hooks/useAdminProjects";
import { Project } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { SiTwitter } from "react-icons/si";
import { Loader } from "../Loader";
import { Table } from "../Table/Table";

export const AdminProjectsTable = () => {
  const { data: projects, isLoading } = useAdminProjects();

  const handleVerifyProject = useHandleVerifyProject();

  const handleApprove = (projectSlug: string) => {
    handleVerifyProject.mutate({
      projectSlug,
      verified: true,
    });
  };

  const handleReject = (projectSlug: string) => {
    handleVerifyProject.mutate({
      projectSlug,
      verified: false,
    });
  };

  const cols = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: "Avatar",
        cell: (col) => (
          <img
            src={`${col.getValue() ?? "/images/AvatarPlaceholder-1.png"}`}
            className="w-8 h-8 rounded-md"
            alt=""
          />
        ),
        accessorFn: (row) => row.imageUrl,
      },
      {
        header: "Name",
        cell: (col) => <span className="text-lg">{`${col.getValue()}`}</span>,
        accessorFn: (row) => row.name,
      },
      {
        header: "Twitter",
        cell: (col) => (
          <Link href={`https://twitter.com/${col.getValue()}`} target="_blank">
            <SiTwitter className="h-4 w-4 text-white" />
          </Link>
        ),
        accessorFn: (row) => row.twitterUsername,
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const projectSlug = col.getValue() as string;

          return (
            <div className="flex gap-4">
              <button
                type="button"
                className="p-2 rounded-md bg-success-500"
                onClick={() => handleApprove(projectSlug)}
              >
                Approve Verification
              </button>
              <button
                type="button"
                className="p-2 rounded-md bg-error-500"
                onClick={() => handleReject(projectSlug)}
              >
                Reject Verification
              </button>
            </div>
          );
        },
        accessorFn: (row) => row.slug,
      },
    ],
    []
  );

  return (
    <div>
      {isLoading && <Loader />}

      {projects && (
        <Table
          data={projects}
          columns={cols}
          isLoading={isLoading}
          pagination={null}
        />
      )}
    </div>
  );
};
