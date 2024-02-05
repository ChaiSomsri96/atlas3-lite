import { FilterOption } from "@/shared/types";
import { extractFilterOptions } from "@/shared/utils";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { HiCheck, HiFilter } from "react-icons/hi";

type Props = {
  filterOptions: FilterOption[];
  handleFilter: (options: string) => void;
  defaultFilterOptions?: (FilterOption | undefined)[];
};

export default function FilterButton({
  filterOptions,
  handleFilter,
  defaultFilterOptions,
}: Props) {
  const handleClickOption = (option: FilterOption) => {
    filterOptions.map((item) => {
      if (item.id == option.id) {
        item.checked = !item.checked;
      }
    });

    handleFilter(extractFilterOptions(filterOptions));
  };

  useEffect(() => {
    if (!defaultFilterOptions) return;
    for (const defaultFilter of defaultFilterOptions) {
      if (!defaultFilter || defaultFilter.checked) {
        continue;
      }

      defaultFilter.checked = true;
      handleFilter(extractFilterOptions(filterOptions));
    }
  }, []);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="rounded-xl bg-gray-800 p-2">
            <HiFilter size={20} />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
            <div className="px-1 py-1">
              {filterOptions.map((item) => (
                <Menu.Item key={item.id}>
                  {({}) => (
                    <button
                      className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                      onClick={() => handleClickOption(item)}
                    >
                      <div className="text-primary-500 w-8 h-8 flex justify-center items-center">
                        {item.checked ? (
                          <HiCheck className="h-6 w-6 text-white" />
                        ) : null}
                      </div>
                      <span>{item.name}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
