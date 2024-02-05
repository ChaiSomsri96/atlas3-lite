import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useMemo } from "react";
import { HiArrowLeft, HiArrowRight, HiChevronDown } from "react-icons/hi";

type Props = {
  page: number;
  pageLength: number;
  total: number | undefined;
  handlePage: (x: number) => void;
  handlePageLength: (x: number) => void;
};

const PAGE_LENS = [1, 5, 10, 20, 50];

export default function Pagination({
  page,
  pageLength,
  total,
  handlePage,
  handlePageLength,
}: Props) {
  const renderPagination = useMemo(() => {
    const maxPage = Math.ceil((total ?? 0) / pageLength);
    const div = [];

    let startIdx = Math.max(page - 1, 1);
    if (startIdx >= maxPage - 2) {
      startIdx = Math.max(maxPage - 2, 1);
    }

    const endIdx = Math.min(startIdx + 2, maxPage);

    if (startIdx > 1) {
      div.push(
        <button
          type="button"
          onClick={() => handlePage(1)}
          className={`relative z-10 inline-flex items-center border border-gray-700 px-4 py-2 text-sm font-medium hover:text-white text-${
            page == 1 ? "white" : "gray-500"
          }`}
        >
          {1}
        </button>
      );

      if (startIdx > 2) {
        div.push(
          <span className="relative inline-flex items-center border border-gray-700 px-4 py-2 text-sm font-medium text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let idx = startIdx; idx <= endIdx; idx++) {
      div.push(
        <button
          type="button"
          onClick={() => handlePage(idx)}
          className={`relative z-10 inline-flex items-center border border-gray-700 px-4 py-2 text-sm font-medium hover:text-white text-${
            idx == page ? "white" : "gray-500"
          }`}
        >
          {idx}
        </button>
      );
    }

    if (endIdx < maxPage) {
      if (endIdx < maxPage - 1) {
        div.push(
          <span className="relative inline-flex items-center border border-gray-700 px-4 py-2 text-sm font-medium text-gray-500">
            ...
          </span>
        );
      }

      div.push(
        <button
          type="button"
          onClick={() => handlePage(maxPage)}
          className={`relative z-10 inline-flex items-center border border-gray-700 px-4 py-2 text-sm font-medium hover:text-white text-${
            maxPage == page ? "white" : "gray-500"
          }`}
        >
          {maxPage}
        </button>
      );
    }

    return div;
  }, [page, pageLength, total]);

  const handlePrev = () => {
    if (page > 1) {
      handlePage(page - 1);
    }
  };

  const handleNext = () => {
    const maxPage = Math.ceil((total ?? 0) / pageLength);
    if (page < maxPage) {
      handlePage(page + 1);
    }
  };

  return (total ?? 0) > pageLength ? (
    <div className="flex items-center justify-end gap-4 px-4 py-3 sm:px-6">
      <div>
        <Listbox value={pageLength} onChange={handlePageLength}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left border border-gray-700 shadow-md focus:outline-none  focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 sm:text-sm">
              <span className="block truncate">{pageLength}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <HiChevronDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto border border-gray-700 rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {PAGE_LENS.map((len, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                        active ? "text-white" : "text-neutral-500"
                      }`
                    }
                    value={len}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium text-white" : "font-normal"
                          }`}
                        >
                          {len}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      <div>
        <nav
          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <button
            type="button"
            className="relative inline-flex items-center rounded-l-md border border-gray-700 px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            onClick={handlePrev}
          >
            <HiArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {renderPagination}
          <button
            type="button"
            className="relative inline-flex items-center rounded-r-md border border-gray-700 px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
            onClick={handleNext}
          >
            <HiArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  ) : null;
}
