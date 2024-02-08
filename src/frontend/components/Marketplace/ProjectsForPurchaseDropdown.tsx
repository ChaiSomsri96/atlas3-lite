import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { Project } from "@prisma/client";
import { ArrowDown2 } from "iconsax-react";
import { ProjectsForPurchaseResponseData } from "@/frontend/hooks/useMarketplaceUserProjectsForPurchase";

export const ProjectsForPurchaseDropdown = ({
  allProjects,
  setValue,
}: {
  allProjects: ProjectsForPurchaseResponseData | undefined;
  setValue: (projectId: string) => void;
}) => {
  const [search, setSearch] = useState<string>("");
  const [collectionsShow, setCollectionsShow] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project>();

  const projects = useMemo(() => {
    return allProjects?.projects
      .filter((x) => {
        if (x.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
          return true;
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [allProjects, search]);

  const searchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (evt: Event) => {
    if (searchRef.current && !searchRef.current.contains(evt.target as Node)) {
      setCollectionsShow(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    setCollectionsShow(false);
    setSelectedProject(project);
    setValue(project.id);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    setSearch("");
  }, [collectionsShow]);

  return (
    <div>
      <Menu as="div" className="relative" ref={searchRef}>
        <button
          className="w-full bg-gray-800 px-4 py-2 rounded-lg form-input border-gray-700 flex gap-2 items-center justify-between"
          type="button"
          onClick={() => setCollectionsShow(true)}
        >
          <span className="text-sm text-gray-400">
            {selectedProject?.name ?? "Select one"}
          </span>
          <ArrowDown2 size={14} className="text-gray-400" />
        </button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          show={collectionsShow}
        >
          <Menu.Items className="absolute right-0 z-[10] mt-2 w-full origin-top-right rounded-lg bg-dark-800 shadow-lg border border-dark-400">
            <div className="flex flex-col">
              <div
                className="bg-gray-800 px-4 py-2 rounded-lg flex gap-2 items-center w-full"
                onKeyDown={(e) => e.stopPropagation()}
              >
                <HiSearch size={24} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Projects"
                  className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
                />
              </div>
              <div className="max-h-64 overflow-y-auto sidebar-scroll">
                {projects
                  ? projects.map((project, idx) => (
                      <Menu.Item key={idx}>
                        {({ active }) => (
                          <button
                            type="button"
                            className={clsx(
                              active
                                ? "bg-dark-500 text-gray-100"
                                : "text-gray-200",
                              "px-3 py-3 text-sm rounded-lg w-full z-[100]"
                            )}
                            onClick={() => handleSelectProject(project)}
                          >
                            <p className="flex justify-start items-center gap-2">
                              <img
                                src={
                                  project.imageUrl ??
                                  "/images/AvatarPlaceholder-1.png"
                                }
                                className={`w-7 h-7 rounded-md`}
                                alt=""
                              />
                              <span className="font-bold mr-2 flex-1 capitalize text-left">
                                {project.name}
                              </span>
                              {NetworkIcon[project.network]}
                            </p>
                          </button>
                        )}
                      </Menu.Item>
                    ))
                  : null}
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
