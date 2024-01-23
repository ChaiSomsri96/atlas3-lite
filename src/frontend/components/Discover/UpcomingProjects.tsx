import { useUpcomingProjects } from "@/frontend/hooks/useUpcomingProjects";
import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { FilterOption, NetworkFilters, SortOption } from "@/shared/types";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import { addMonths, format } from "date-fns";
import { useEffect, useState } from "react";
import FilterButton from "../FilterButton";
import { ProjectCard } from "../ProjectCard";
import SortButton from "../SortButton";

const FILTER_OPTIONS: FilterOption[] = NetworkFilters;

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

export const UpcomingProjects = () => {
  const [upcomingDate, setUpcomingDate] = useState<Date>(new Date());
  const [total, setTotal] = useState<number>();
  const [projKeys, setProjKeys] = useState<string[]>([]);
  const [projGroups, setProjGroups] = useState<{
    [key: string]: ExtendedProject[];
  }>();
  const [filterOptions, setFilterOptions] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].id);

  const { data: ret } = useUpcomingProjects({
    upcomingDate,
    sortOption,
    filterOptions,
  });

  useEffect(() => {
    if (ret) {
      setTotal(ret.projects.length);

      const groups = ret.projects.reduce(
        (group: { [key: string]: ExtendedProject[] }, project) => {
          const { mintDate } = project;
          if (mintDate) {
            const mintDay = format(new Date(mintDate), "dd, EEEE");
            group[mintDay] = group[mintDay] ?? [];
            group[mintDay].push(project);
          }

          return group;
        },
        {}
      );

      setProjGroups(groups);
      setProjKeys(Object.keys(groups).sort((a, b) => a.localeCompare(b)));
    }
  }, [ret]);
  console.log(projGroups, projKeys);

  const handleSort = (sortOption: string) => {
    setSortOption(sortOption);
  };

  const handleFilter = (filterOptions: string) => {
    setFilterOptions(filterOptions);
  };

  const handlePrev = () => {
    setUpcomingDate(addMonths(upcomingDate, -1));
  };

  const handleNext = () => {
    setUpcomingDate(addMonths(upcomingDate, 1));
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center -mt-12 gap-4">
        <div></div>
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

      <div
        className="w-full rounded-lg text-white text-lg p-2 flex justify-center gap-6 my-4"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 53, 94, 0) 0%, #00355E 50.28%, rgba(0, 53, 94, 0) 100.56%)",
        }}
      >
        <button type="button" onClick={handlePrev}>
          <ArrowLeft2 />
        </button>
        <span className="text-xl font-semibold w-48 text-center">
          {format(upcomingDate, "LLLL, yyyy")}
        </span>
        <button type="button" onClick={handleNext}>
          <ArrowRight2 />
        </button>
      </div>

      <>
        {projGroups &&
          projKeys.map((projKey, idx) => (
            <div className="mb-4" key={idx}>
              <h1 className="text-white text-xl mb-2 font-semibold">
                {projKey}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projGroups[projKey].map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant="all"
                  />
                ))}
              </div>
            </div>
          ))}
      </>
    </div>
  );
};
