import { SortOption } from "@/shared/types";
import { Tab } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaFrown, FaGrinWink, FaMedal, FaRunning } from "react-icons/fa";
import { TbCircle } from "react-icons/tb";
import SortButton from "../SortButton";
import GiveawayTab from "./GiveawayTab";

const SORT_OPTIONS: SortOption[] = [
  {
    id: "endsAt_desc",
    name: "End Date",
  },
  {
    id: "endsAt_asc",
    name: "End Date",
  },
];

export default function MyGiveaways() {
  const [total, setTotal] = useState<number>();
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
  };
  const handleTotal = (total: number) => {
    setTotal(total);
  };

  return (
    <div>
      <div className="flex gap-2 items-center justify-end -mt-12">
        {
          <p className="mr-2 text-sm text-gray-400 hidden sm:block">
            {total ?? "-"} Giveaways available
          </p>
        }

        <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
      </div>

      <Tab.Group>
        <Tab.List className="flex xs:flex-row flex-col w-full sm:gap-8 gap-4 my-8">
        <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected &&
                  "text-primary-500 border-primary-500 font-semibold"
                } border sm:px-4 px-2 py-3 rounded-xl text-md flex-1 flex gap-2 items-center hover:border-primary-500`}
              >
                <FaRunning size={24} />
                <span className="flex-1 text-left">Running</span>
                <TbCircle />
              </button>
            )}
          </Tab>
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected &&
                  "text-primary-500 border-primary-500 font-semibold"
                } border sm:px-4 px-2 py-3 rounded-xl text-md flex-1 flex gap-2 items-center hover:border-primary-500`}
              >
                <FaGrinWink size={24} />
                <span className="flex-1 text-left">Joined</span>
                <TbCircle />
              </button>
            )}
          </Tab>

          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected &&
                  "text-primary-500 border-primary-500 font-semibold"
                } border sm:px-4 px-2 py-3 rounded-xl text-md flex-1 flex gap-2 items-center hover:border-primary-500`}
              >
                <FaMedal size={20} />
                <span className="flex-1 text-left">Won</span>
                <TbCircle />
              </button>
            )}
          </Tab>

          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={`${
                  selected &&
                  "text-primary-500 border-primary-500 font-semibold"
                } border sm:px-4 px-2 py-3 rounded-xl text-md flex-1 flex gap-2 items-center hover:border-primary-500`}
              >
                <FaFrown size={24} />
                <span className="flex-1 text-left">Lost</span>
                <TbCircle />
              </button>
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel className="mt-3">
            <GiveawayTab
              giveawayStatus="running"
              sortOption={sortOption}
              handleTotal={handleTotal}
            />
          </Tab.Panel>
          <Tab.Panel className="mt-3">
            <GiveawayTab
              giveawayStatus="entered"
              sortOption={sortOption}
              handleTotal={handleTotal}
            />
          </Tab.Panel>
          <Tab.Panel className="mt-3">
            <GiveawayTab
              giveawayStatus="won"
              sortOption={sortOption}
              handleTotal={handleTotal}
            />
          </Tab.Panel>
          <Tab.Panel className="mt-3">
            <GiveawayTab
              giveawayStatus="lost"
              sortOption={sortOption}
              handleTotal={handleTotal}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
