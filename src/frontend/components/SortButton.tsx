import { SortOption } from "@/shared/types";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { HiArrowDown, HiArrowUp, HiSortAscending } from "react-icons/hi";

type Props = {
  sortOptions: SortOption[];
  handleSort: (option: string) => void;
  defaultSort?: SortOption;
};

export default function SortButton({
  sortOptions,
  handleSort,
  defaultSort,
}: Props) {
  const [selectedItem, setSelectItem] = useState(sortOptions[0].id);

  const clickSort = (option: SortOption) => {
    handleSort(option.id);
    setSelectItem(option.id);
  };

  useEffect(() => {
    if (!defaultSort) return;

    handleSort(defaultSort.id);
    setSelectItem(defaultSort.id);
  }, []);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="rounded-xl bg-gray-800 p-2">
            <HiSortAscending size={20} />
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
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
            <div className="px-1 py-1">
              {sortOptions.map((item) => (
                <Menu.Item key={item.id}>
                  {({}) => (
                    <button
                      className={`bg-transparent group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-400 hover:text-primary-500`}
                      onClick={() => clickSort(item)}
                    >
                      <div className="text-primary-500 w-8 h-8 flex justify-center items-center">
                        {item.id.endsWith("_asc") ? (
                          <HiArrowUp className="h-4 w-4 text-white" />
                        ) : (
                          <HiArrowDown className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span
                        className={`${
                          selectedItem == item.id ? "font-bold text-white" : ""
                        }`}
                      >
                        {item.name}
                      </span>
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
