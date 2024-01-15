/*import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader } from "../Loader";
import { Table } from "../Table/Table";
import { format } from "date-fns";
import { PrimaryButton } from "@/styles/BaseComponents";
import { useAdminLottery } from "@/frontend/hooks/useAdminLottery";
import { useHandleEndLottery } from "@/frontend/handlers/useHandleEndLottery";
import { useHandleDeleteLottery } from "@/frontend/handlers/useHandleDeleteLottery";
import { ExtendedLottery } from "@/frontend/hooks/useRunningLottery";
import CreateEditLotterySlideover from "./CreateEditLotterySlideover";

export const AdminLottery = () => {
  const { data: lotteries, isLoading, refetch } = useAdminLottery();
  const [lottery, setLottery] = useState<ExtendedLottery | undefined>(
    undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleEndLottery = useHandleEndLottery();
  const handleDeleteLottery = useHandleDeleteLottery();

  const cols = useMemo<ColumnDef<ExtendedLottery>[]>(
    () => [
      {
        header: "Title",
        cell: (col) => {
          const obj = col.getValue() as ExtendedLottery;
          return (
            <div>
              <div className="flex gap-2">
                <div className="-mt-1 flex flex-col">
                  <h1 className="text-white text-xl font-semibold">
                    {obj.usdReward}
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
          const obj = col.getValue() as ExtendedLottery;
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
          const obj = col.getValue() as ExtendedLottery;
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
          const obj = col.getValue() as ExtendedLottery;

          return (
            <div className="flex gap-4">
              {obj.status === "RUNNING" && (
                <>
                  <button
                    type="button"
                    className="p-2 rounded-md bg-primary-500"
                    onClick={() => {
                      setLottery(obj);
                      setIsOpen(true);
                    }}
                  >
                    Edit Lottery
                  </button>

                  <button
                    type="button"
                    className="p-2 rounded-md bg-error-500"
                    onClick={async () => {
                      await handleEndLottery.mutateAsync({ id: obj.id });
                      refetch();
                    }}
                  >
                    End Lottery
                  </button>

                  {obj.usersEntered === 0 && (
                    <button
                      type="button"
                      className="p-2 rounded-md bg-error-500"
                      onClick={async () => {
                        await handleDeleteLottery.mutateAsync({
                          id: obj.id,
                        });
                        refetch();
                      }}
                    >
                      Delete Lottery
                    </button>
                  )}
                </>
              )}
              {obj.status === "FINALIZED" && obj.processed && (
                <Link
                  href={`/api/admin/lottery/${obj.id}/download-winners`}
                  target="_blank"
                  className="p-2 rounded-md bg-success-500"
                  onClick={() => setLottery(obj)}
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
            setLottery(undefined);
          }}
        >
          Create Lottery
        </PrimaryButton>
      </div>
      {lotteries && (
        <Table
          data={lotteries}
          columns={cols}
          isLoading={isLoading}
          pagination={null}
        />
      )}
      <CreateEditLotterySlideover
        open={isOpen}
        setOpen={setIsOpen}
        lottery={lottery}
        refetch={refetch}
      />
    </div>
  );
};
*/

export const AdminLottery = () => {
  {
    return <></>;
  }
};
