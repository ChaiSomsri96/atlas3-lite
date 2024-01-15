import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader } from "../Loader";
import { Table } from "../Table/Table";
import { useAdminRaffles } from "@/frontend/hooks/useAdminRaffles";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { format } from "date-fns";
import CreateEditRaffleSlideover from "./CreateEditRaffleSlideover";
import { useHandleEndRaffle } from "@/frontend/handlers/useHandleEndRaffle";
import { PrimaryButton } from "@/styles/BaseComponents";
import { useHandleDeleteRaffle } from "@/frontend/handlers/useHandleDeleteRaffle";

export const AdminRaffles = () => {
  const { data: raffles, isLoading, refetch } = useAdminRaffles();
  const [raffle, setRaffle] = useState<ExtendedGiveaway | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handleEndRaffle = useHandleEndRaffle();
  const handleDeleteRaffle = useHandleDeleteRaffle();

  const cols = useMemo<ColumnDef<ExtendedGiveaway>[]>(
    () => [
      {
        header: "Title",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <div>
              <div className="flex gap-2">
                <div className="-mt-1 flex flex-col">
                  <h1 className="text-white text-xl font-semibold">
                    {obj.name}
                  </h1>
                  <span className="text-md text-neutral-400">
                    Created:{" "}
                    {format(
                      Date.parse(obj.createdAt.toString()),
                      "dd EEE, hh:mm aa"
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Supply",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <div>
              <div className="flex gap-2">{obj.maxWinners}</div>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "Entries",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;
          return (
            <div>
              <div className="flex gap-2">{obj.usersEntered}</div>
            </div>
          );
        },
        accessorFn: (row) => row,
      },
      {
        header: "",
        id: "actions",
        cell: (col) => {
          const obj = col.getValue() as ExtendedGiveaway;

          return (
            <div className="flex gap-4">
              {obj.status === "RUNNING" && (
                <>
                  <button
                    type="button"
                    className="p-2 rounded-md bg-primary-500"
                    onClick={() => {
                      setRaffle(obj);
                      setIsOpen(true);
                    }}
                  >
                    Edit Raffle
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-md bg-error-500"
                    onClick={async () => {
                      await handleEndRaffle.mutateAsync({ slug: obj.slug });
                      refetch();
                    }}
                  >
                    End Raffle
                  </button>

                  {obj.usersEntered === 0 && (
                    <button
                      type="button"
                      className="p-2 rounded-md bg-error-500"
                      onClick={async () => {
                        await handleDeleteRaffle.mutateAsync({
                          slug: obj.slug,
                        });
                        refetch();
                      }}
                    >
                      Delete Raffle
                    </button>
                  )}
                </>
              )}
              {obj.status === "FINALIZED" && obj.processed && (
                <Link
                  href={`/api/admin/raffles/${obj.slug}/download-winners`}
                  target="_blank"
                  className="p-2 rounded-md bg-success-500"
                  onClick={() => setRaffle(obj)}
                >
                  Export Winners
                </Link>
              )}
            </div>
          );
        },
        accessorFn: (row) => row,
      },
    ],
    []
  );

  return (
    <div>
      {isLoading && <Loader />}
      <div className="flex">
        <PrimaryButton
          onClick={() => {
            setIsOpen(true);
            setRaffle(undefined);
          }}
        >
          Create Raffle
        </PrimaryButton>
      </div>
      {raffles && (
        <Table
          data={raffles}
          columns={cols}
          isLoading={isLoading}
          pagination={null}
        />
      )}
      <CreateEditRaffleSlideover
        open={isOpen}
        setOpen={setIsOpen}
        raffle={raffle}
        refetch={refetch}
      />
    </div>
  );
};
