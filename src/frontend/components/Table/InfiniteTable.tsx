import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "../Loader";

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  total: number | undefined;
  isLoading: boolean;
  isDropdownOpen: boolean;
  handleNext: () => void;
}

export const infinitePageLength = 20;

export const InfiniteTable = <T extends object>({
  data,
  columns,
  total,
  isLoading,
  isDropdownOpen,
  handleNext,
}: ReactTableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    data && (
      <InfiniteScroll
        dataLength={data.length}
        next={handleNext}
        hasMore={data.length < (total ?? 0)}
        loader={null}
      >
        <div className="flex flex-col z-10">
          <div className="">
            <div className="inline-block 2xl:w-full lg:w-[calc(100vw-24rem)] sm:w-[calc(100vw-3rem)] w-[calc(100vw-2rem)] py-4 sm:overflow-x-auto overflow-x-scroll overflow-y-auto sidebar-scroll">
              <div className="md:p-2">
                <table className="min-w-full">
                  <thead className="bg-gray-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-4 text-sm font-medium text-gray-300 text-left first:rounded-l-xl last:rounded-r-xl"
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
                            className="px-4 py-4 whitespace-nowrap text-sm font-light text-white overflow-visible relative"
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
                  </tbody>
                </table>

                {isLoading && <Loader />}

                {isDropdownOpen && (
                  <div className="h-[320px] flex justify-center items-center" />
                )}
              </div>
            </div>
          </div>
        </div>
      </InfiniteScroll>
    )
  );
};
