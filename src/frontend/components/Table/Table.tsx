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

export const Table = <T extends object>({
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
        <div className="inline-block 2xl:w-full lg:w-[calc(100vw-24rem)] sm:w-[calc(100vw-3rem)] w-[calc(100vw-2rem)] pt-4 pb-72 2xl:px-8 sm:overflow-x-auto overflow-x-scroll overflow-y-auto">
          <div className="md:p-2">
            {isLoading ? (
              <Loader />
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-sm font-medium text-gray-300 text-left first:rounded-l-xl last:rounded-r-xl"
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
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-gray-700">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          className="whitespace-nowrap px-6 py-6 text-sm font-light text-white max-w-[15rem]"
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

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
