import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader } from "../Loader";

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  pagination: React.ReactNode;
}

export const LeaderboardTable = <T extends object>({
  data,
  columns,
  isLoading,
  pagination,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col z-10">
      <div className="2xl:-mx-10">
        <div className="inline-block w-full pt-4 2xl:px-8">
          <div className="md:p-2">
            {isLoading ? (
              <Loader />
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          className={`${
                            index === 0
                              ? "left-0 z-10 bg-gray-800 md:bg-transparent"
                              : "z-0"
                          } sticky first:pl-6 last:pr-6 py-4 text-sm font-medium text-gray-300 text-left first:rounded-l-xl last:rounded-r-xl ${
                            index !== 0 ? "pr-4" : ""
                          }`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, 100)
                    .map((row) => {
                      return (
                        <tr key={row.id} className="border-b border-gray-700">
                          {row.getVisibleCells().map((cell, index) => (
                            <td
                              className={`${
                                index === 0
                                  ? "left-0 z-10 bg-gray-800 md:bg-transparent"
                                  : "z-0"
                              } sticky whitespace-nowrap rounded-2xl last:pr-6 py-3 text-sm font-light text-white max-w-[20rem]`}
                              key={cell.id}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}

                  <tr>
                    <td colSpan={columns.length}>{pagination}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
