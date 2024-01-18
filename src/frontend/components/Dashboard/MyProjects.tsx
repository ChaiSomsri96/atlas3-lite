import { useJoinedProjects } from "@/frontend/hooks/useJoinedProjects";
import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { FilterOption, NetworkFilters, SortOption } from "@/shared/types";
import { useEffect, useState } from "react";
import FilterButton from "../FilterButton";
import { Loader } from "../Loader";
import Pagination from "../Pagination";
import { ProjectCard } from "../ProjectCard";
import SortButton from "../SortButton";

const FILTER_OPTIONS: FilterOption[] = NetworkFilters.concat([
  {
    id: "phase_POSTMINT",
    name: "Post Mint",
    checked: false,
  },
  {
    id: "phase_PREMINT",
    name: "Pre Mint",
    checked: false,
  },
]);

const SORT_OPTIONS: SortOption[] = [
  {
    id: "name_asc",
    name: "Name",
  },
  {
    id: "name_desc",
    name: "Name",
  },
];

export default function MyProjects() {
  const [page, setPage] = useState<number>(1);
  const [pageLength, setPageLength] = useState<number>(20);
  const [filterOptions, setFilterOptions] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);
  const [projects, setProjects] = useState<ExtendedProject[]>();
  const [total, setTotal] = useState<number>();

  const { data: ret, isLoading } = useJoinedProjects({
    page,
    pageLength,
    sortOption,
    filterOptions,
  });

  useEffect(() => {
    if (ret) {
      setProjects(ret.projects);
      setTotal(ret.total);
    }
  }, [ret]);

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
    setPage(1);
  };

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
    setPage(1);
  };

  const handlePage = (page: number) => {
    setPage(page);
  };

  const handlePageLength = (pageLength: number) => {
    setPageLength(pageLength);
    setPage(1);
  };

  return (
    <div>
      <div className="flex gap-2 items-center justify-end -mt-12">
        {
          <p className="mr-2 text-sm text-gray-400 hidden sm:block">
            {projects ? projects.length : "-"} Projects available
          </p>
        }

        <FilterButton
          filterOptions={FILTER_OPTIONS}
          handleFilter={handleFilter}
        />

        <SortButton sortOptions={SORT_OPTIONS} handleSort={handleSort} />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        projects && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant={"mine"}
              />
            ))}
          </div>
        )
      )}

      <Pagination
        pageLength={pageLength}
        total={total}
        page={page}
        handlePage={handlePage}
        handlePageLength={handlePageLength}
      />
    </div>
  );
}
