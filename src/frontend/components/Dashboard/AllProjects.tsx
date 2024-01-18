import { useAllProjects } from "@/frontend/hooks/useAllProjects";
import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { FilterOption, NetworkFilters, SortOption } from "@/shared/types";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroll-component";
import FilterButton from "../FilterButton";
import { Loader } from "../Loader";
import { ProjectCard } from "../ProjectCard";
import SortButton from "../SortButton";

const FILTER_OPTIONS: FilterOption[] = NetworkFilters;

const SORT_OPTIONS: SortOption[] = [
  {
    id: "trending_asc",
    name: "Trending",
  },
  {
    id: "trending_desc",
    name: "Trending",
  },
  {
    id: "name_asc",
    name: "Name",
  },
  {
    id: "name_desc",
    name: "Name",
  },
];

export const AllProjects = ({ notMine }: { notMine: boolean }) => {
  const pageLength = 12;
  const [page, setPage] = useState<number>(1);
  const [projects, setProjects] = useState<ExtendedProject[]>();
  const [total, setTotal] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);

  const { data: ret } = useAllProjects({
    page,
    pageLength,
    search,
    sortOption,
    filterOptions,
    notMine,
  });

  useEffect(() => {
    if (ret) {
      if (projects && page > 1) {
        const filteredProjects = ret.projects.filter(
          (project) => !projects.find((p) => p.id === project.id)
        );

        setProjects([...projects, ...filteredProjects]);
      } else {
        setProjects(ret.projects);
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
            placeholder="Search project"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>
        <div className="flex gap-3 items-center sm:w-fit w-full sm:justify-end justify-between">
          <span className="text-neutral-500">{total ?? "-"} Projects</span>
          <div className="flex gap-2">
            <FilterButton
              filterOptions={FILTER_OPTIONS}
              handleFilter={handleFilter}
            />
            <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
          </div>
        </div>
      </div>

      {projects && total && (
        <InfiniteScroll
          dataLength={projects.length}
          next={handleNext}
          hasMore={projects.length < total}
          loader={<Loader />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} variant="all" />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};
