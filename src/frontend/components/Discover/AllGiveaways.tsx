import { useAllGiveaways } from "@/frontend/hooks/useAllGiveaways";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { FilterOption, NetworkFilters, SortOption } from "@/shared/types";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroll-component";
import { GiveawayCard } from "../GiveawayCard";
import FilterButton from "../FilterButton";
import { Loader } from "../Loader";
import SortButton from "../SortButton";

const FILTER_OPTIONS: FilterOption[] = NetworkFilters;

const SORT_OPTIONS: SortOption[] = [
  {
    id: "entryCount_desc",
    name: "Entry Count",
  },
  {
    id: "entryCount_asc",
    name: "Entry Count",
  },
];

export const AllGiveaways = () => {
  const pageLength = 12;
  const [page, setPage] = useState<number>(1);
  const [giveaways, setGiveaways] = useState<ExtendedGiveaway[]>();
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);

  const { data: ret } = useAllGiveaways({
    page,
    pageLength,
    search,
    sortOption,
    filterOptions,
  });

  useEffect(() => {
    if (ret) {
      if (giveaways && page > 1) {
        setGiveaways([...giveaways, ...ret.giveaways]);
      } else {
        setGiveaways(ret.giveaways);
      }

      setTotal(ret.total);
    }
  }, [ret]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
  };

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center my-8 gap-4">
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center sm:w-fit w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search giveaways"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-neutral-500">{total ?? "-"} Giveaways</span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
            />
            <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
          </div>
        </div>
      </div>

      {giveaways && (
        <InfiniteScroll
          dataLength={giveaways.length}
          next={handleNext}
          hasMore={giveaways.length < (total ?? 0)}
          loader={<Loader />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {giveaways.map((giveaway) => (
              <GiveawayCard
                key={giveaway.id}
                giveaway={giveaway}
                variant="all"
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};
