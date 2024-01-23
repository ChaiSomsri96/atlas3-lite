import { Fragment, useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { HiOutlineGift } from "react-icons/hi";
import { IoIosPeople } from "react-icons/io";
import { TbSocial } from "react-icons/tb";
import {
  MdAddCircle,
  MdCallMade,
  MdCallReceived,
  MdDeleteSweep,
  MdLeaderboard,
  MdMoney,
  MdOutlineAccountBalanceWallet,
  MdStarOutline,
} from "react-icons/md";

import { Listbox, Transition } from "@headlessui/react";
import { RxArrowRight, RxChevronDown } from "react-icons/rx";
import { useRouter } from "next/router";
import { useOwnedProjects } from "../hooks/useOwnedProjects";
import { useHandlePublishProject } from "../handlers/useHandlePublishProject";
import { Project, ProjectStatus } from "@prisma/client";
import { SidebarItem } from "./SidebarItem";
import { GoPrimitiveDot } from "react-icons/go";
import { useCreatorStats } from "../hooks/useCreatorStats";
import { HiCog } from "react-icons/hi2";

export default function CreatorSidebar() {
  const { data: projects, isLoading: projectsLoading } = useOwnedProjects();
  const router = useRouter();
  const projectManagementNavigation = [
    {
      name: "Project Details",
      href: `/creator/project/${router.query.projectSlug}`,
      icon: CiSettings,
      current: router.asPath === `/creator/project/${router.query.projectSlug}`,
    },
    {
      name: "Team Management",
      href: `/creator/project/${router.query.projectSlug}/manage-team`,
      icon: IoIosPeople,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/manage-team`,
    },
    {
      name: "Social Accounts",
      href: `/creator/project/${router.query.projectSlug}/socials`,
      icon: TbSocial,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/socials`,
    },
    {
      name: "Rankings ",
      href: `/creator/project/${router.query.projectSlug}/rankings`,
      icon: MdLeaderboard,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/rankings`,
    },
    {
      name: "Allowlist Marketplace ",
      href: `/creator/project/${router.query.projectSlug}/marketplace`,
      icon: MdMoney,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/marketplace`,
    },
    ...(router.query.projectSlug !== "meegos"
      ? [
          {
            name: "Applications",
            href: `/creator/project/${router.query.projectSlug}/applications`,
            icon: MdStarOutline,
            current:
              router.asPath ===
              `/creator/project/${router.query.projectSlug}/applications`,
          },
        ]
      : []),
    ...(router.query.projectSlug === "meegos"
      ? [
          {
            name: "Applications",
            href: `/creator/project/${router.query.projectSlug}/meelist-applications`,
            icon: MdMoney,
            current:
              router.asPath ===
              `/creator/project/${router.query.projectSlug}/meelist-applications`,
          },
        ]
      : []),
  ];

  const [selectedProject, setselectedProject] = useState<Project>();

  const creatorStats = useCreatorStats({
    projectId: selectedProject?.id,
  });

  const noSettingsConfigured =
    (!selectedProject?.discordGuild?.giveawayChannelId ||
      selectedProject?.discordGuild?.giveawayChannelId === "") &&
    (!selectedProject?.discordGuild?.giveawayRoleTagId ||
      selectedProject?.discordGuild?.giveawayRoleTagId === "") &&
    (!selectedProject?.defaultRules ||
      selectedProject?.defaultRules.length === 0) &&
    (!selectedProject?.holderRules ||
      selectedProject?.holderRules.length === 0);

  const collabManagementNavigation = [
    {
      name: "Giveaways",
      href: `/creator/project/${router.query.projectSlug}/giveaways`,
      icon: HiOutlineGift,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/giveaways`,
    },
    {
      name: "Incoming Requests",
      href: `/creator/project/${router.query.projectSlug}/incoming-requests`,
      icon: MdCallReceived,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/incoming-requests`,
      count: creatorStats?.data?.incoming.totalCount,
    },
    {
      name: "Outgoing Requests",
      href: `/creator/project/${router.query.projectSlug}/outgoing-requests`,
      icon: MdCallMade,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/outgoing-requests`,
      count: creatorStats?.data?.outgoing.totalCount,
    },
    {
      name: "Settings",
      href: `/creator/project/${router.query.projectSlug}/giveaway-settings`,
      icon: HiCog,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/giveaway-settings`,
      warning: noSettingsConfigured,
    },
  ];

  const walletCollectionNavigation = [
    {
      name: "Wallet/Allowlist Collection",
      href: `/creator/project/${router.query.projectSlug}/wallet-collection`,
      icon: MdOutlineAccountBalanceWallet,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/wallet-collection`,
    },
  ];

  const discordManagementNavigation = [
    {
      name: "Bulk Add Roles",
      href: `/creator/project/${router.query.projectSlug}/bulk-add-roles`,
      icon: MdAddCircle,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/bulk-add-roles`,
    },
    {
      name: "Purge Users",
      href: `/creator/project/${router.query.projectSlug}/purge-users`,
      icon: MdDeleteSweep,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/purge-users`,
    },
  ];

  const presaleManagementNavigation = [
    {
      name: "Presales",
      href: `/creator/project/${router.query.projectSlug}/presales`,

      icon: MdMoney,
      current:
        router.asPath ===
        `/creator/project/${router.query.projectSlug}/presales`,
    },
  ];

  const handlePublishProject = useHandlePublishProject();
  useEffect(() => {
    if (projects && projects.length > 0) {
      if (router.query.projectSlug) {
        const project = projects.find(
          (project) => project.slug === router.query.projectSlug
        );
        if (project) {
          setselectedProject(project);
        }
      }
    }
  }, [projects]);

  return (
    <div className="flex flex-col pt-3">
      {!projectsLoading && projects && projects.length > 0 && (
        <div className="border-b border-gray-500 pb-2">
          <Listbox
            value={selectedProject}
            onChange={(project) => {
              setselectedProject(project as Project);
              router.push(`/creator/project/${project?.slug}`);
            }}
          >
            <div className="relative ">
              <Listbox.Button className="relative w-full cursor-default rounded-lg  text-left shadow-md sm:text-sm bg-dark-600 py-2 px-3">
                <span className={`flex gap-3 items-center truncate`}>
                  <img
                    src={
                      selectedProject?.imageUrl ||
                      "https://images.unsplash.com/photo-1674566624661-cb47ba4b8339?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                    }
                    alt="Project Logo"
                    className="w-6 h-6 object-cover rounded-lg"
                  />

                  {selectedProject?.name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <RxChevronDown
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
                <Listbox.Options className="absolute z-20 mt-1 w-56 max-h-60 overflow-auto rounded-md bg-dark-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {projects?.map((project, projectIdx) => (
                    <Listbox.Option
                      key={`project-${projectIdx}-${project.name}`}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 px-2 mx-1 rounded-lg ${
                          active ? "bg-gray-500 text-gray-100" : "text-gray-200"
                        }`
                      }
                      value={project}
                    >
                      <>
                        <span className={`flex gap-3 items-center truncate`}>
                          <img
                            src={
                              project.imageUrl ||
                              "https://images.unsplash.com/photo-1674566624661-cb47ba4b8339?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                            }
                            alt="Project Logo"
                            className="w-6 h-6 object-cover rounded-lg"
                          />

                          {project.name}
                        </span>
                      </>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {selectedProject && (
            <div className="mt-2">
              <div
                className={`${
                  {
                    [ProjectStatus.DRAFT]: "bg-red-500",
                    [ProjectStatus.PUBLISHED]: "bg-green-800",
                  }[selectedProject.status]
                }
                  } border border-dark-600 w-full h-6 rounded-lg flex justify-center items-center -z-10`}
              >
                <p className="text-xs flex gap-2 items-center">
                  <GoPrimitiveDot
                    className={`inline-flex rounded-full w-2 h-2 bg-white animate -z-0 ${
                      selectedProject.status === ProjectStatus.PUBLISHED
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {
                    {
                      [ProjectStatus.DRAFT]: "Draft",
                      [ProjectStatus.PUBLISHED]: "Published",
                    }[selectedProject.status]
                  }{" "}
                  Project
                </p>
              </div>

              {selectedProject.status === ProjectStatus.DRAFT && (
                <button
                  className="w-full bg-dark-700 mt-1 rounded-lg border border-dark-600 hover:bg-dark-600 transition duration-200 ease-in-out"
                  onClick={() => {
                    handlePublishProject.mutate({
                      project: selectedProject,
                    });
                  }}
                >
                  <div className="flex gap-1 items-center w-full justify-center py-1 bg-primary-600 rounded-lg ">
                    <p className="text-xs">Publish Project</p>
                    <RxArrowRight className="h-4 w-4 text-gray-200" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 mt-6">
        <h2 className="text-white text-xl font-bold ">Project Management</h2>

        <div className="space-y-2">
          {projectManagementNavigation.map((link) => (
            <SidebarItem
              key={link.name}
              Icon={link.icon}
              text={link.name}
              href={link.href}
              active={link.current}
            />
          ))}
        </div>
      </div>

      <div className="py-2">
        <h2 className="text-white text-xl font-bold ">Allowlist Management</h2>

        <div className="space-y-2">
          {walletCollectionNavigation.map((link) => (
            <SidebarItem
              key={link.name}
              Icon={link.icon}
              text={link.name}
              href={link.href}
              active={link.current}
            />
          ))}
        </div>
      </div>

      <div className="py-2">
        <h2 className="text-white text-xl font-bold ">Giveaway Management</h2>

        <div className="space-y-2">
          {collabManagementNavigation.map((link) => (
            <SidebarItem
              key={link.name}
              Icon={link.icon}
              text={link.name}
              href={link.href}
              active={link.current}
              count={link.count}
              warning={link.warning}
            />
          ))}
        </div>
      </div>

      <div className="py-2">
        <h2 className="text-white text-xl font-bold ">Presale Management</h2>

        <div className="space-y-2">
          {presaleManagementNavigation.map((link) => (
            <SidebarItem
              key={link.name}
              Icon={link.icon}
              text={link.name}
              href={link.href}
              active={link.current}
            />
          ))}
        </div>
      </div>

      <div className="py-2">
        <h2 className="text-white text-xl font-bold ">Discord Management</h2>

        <div className="space-y-2">
          {discordManagementNavigation.map((link) => (
            <SidebarItem
              key={link.name}
              Icon={link.icon}
              text={link.name}
              href={link.href}
              active={link.current}
            />
          ))}
        </div>
      </div>

      {/* Select component to select project using Headless UI */}
    </div>
  );
}
