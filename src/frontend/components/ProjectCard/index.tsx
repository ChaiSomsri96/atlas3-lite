import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { Popover } from "@headlessui/react";
import { ProjectPhase, ProjectStatus } from "@prisma/client";
import Tippy from "@tippyjs/react";
import { format } from "date-fns";
import Link from "next/link";
import { MouseEvent } from "react";
import { BsCheck, BsThreeDots } from "react-icons/bs";
import { RxLink2 } from "react-icons/rx";
import { SiDiscord, SiTwitter } from "react-icons/si";
import { AvailableRoles } from "../ProjectPublicPage";
import ReactTooltip from "react-tooltip";
import { HiXMark } from "react-icons/hi2";

const WhitelistStatusBadge = ({
  project,
  status,
}: {
  project: ExtendedProject;
  status: "obtained" | "pending" | "closed";
}) => {
  if (status === "pending" || status === "obtained") {
    return (
      <Popover className="relative">
        <Popover.Button>
          <div
            className={`flex justify-center items-center rounded-md ${
              {
                obtained: "bg-green-500",
                pending: "bg-primary-500",
                closed: "bg-gray-500",
              }[status]
            }`}
          >
            {
              {
                obtained: (
                  <div className="flex bg-green-600 text-sm rounded-md items-center gap-1 py-1 px-2">
                    <BsCheck className="w-5 h-5" />
                    Wallet Submitted
                  </div>
                ),
                pending: (
                  <div className="flex bg-primary-500 text-sm rounded-md items-center gap-2 py-1 px-2">
                    <div className="rounded-full w-3 h-3 bg-white" />
                    Submit Wallet
                  </div>
                ),
                closed: (
                  <div className="flex bg-gray-500 text-sm rounded-md items-center gap-1 py-1 px-2">
                    <HiXMark className="w-4 h-4" />
                    Not eligible
                  </div>
                ),
              }[status]
            }
          </div>
        </Popover.Button>

        <Popover.Panel className="absolute right-0 z-10 overflow-visible">
          <AvailableRoles project={project} />
        </Popover.Panel>
      </Popover>
    );
  }

  return (
    <Tippy content="Wallet submissions are closed">
      <div
        className={`flex w-6 h-6 justify-center items-center rounded-md  bg-gray-500`}
      >
        <BsThreeDots className="w-5 h-5 text-gray-200" />
      </div>
    </Tippy>
  );
};

export const ProjectCard = ({
  project,
  variant,
  featured,
}: {
  project: ExtendedProject;
  variant: "all" | "owned" | "mine";
  featured?: boolean;
}) => {
  const isAllowlistObtained =
    project.allowlist?.entries && project.allowlist?.entries?.length > 0;

  const isAllowlistEnabled = project.allowlist?.enabled;

  const openUrl = (e: MouseEvent, url: string | null) => {
    e.stopPropagation();
    e.preventDefault();

    if (url) window.open(url, "_blank");
  };

  /* let link = "";

  // switch statement to determine which link to use
  switch (variant) {
    case "all":
      link = `/project/${project.slug}`;
      break;
    case "owned":
      link = `/creator/project/${project.slug}`;
      break;
    case "mine":
      link = `/project/${project.slug}`;
      break;
  }*/
  return (
    <div className="relative w-full h-40 rounded-lg  hover:shadow-[0px_0px_24px_5px_rgba(0,133,234,0.25)] hover:outline outline-primary-500 cursor-pointer">
      <img
        src={project.bannerUrl ?? "/images/Placeholder-2.png"}
        alt="Project Image"
        className="absolute w-full h-full object-cover -z-10 rounded-lg"
      />

      <div className="absolute bg-gradient-to-t from-dark-800  to-transparent  w-full h-40 -z-10 rounded-lg" />
      <div className="absolute bg-dark-800 opacity-50  w-full h-40 -z-10 rounded-lg" />

      <div className="flex flex-col justify-between w-full h-full pt-3 pb-2 -z-0">
        <Link
          href={
            {
              all: `/project/${project.slug}`,
              mine: `/project/${project.slug}`,
              owned: `/creator/project/${project.slug}`,
            }[variant]
          }
          className="flex-1"
        >
          <div className="flex mx-4 items-center justify-between">
            {(variant === "all" ||
              variant === "owned" ||
              variant === "mine") && (
              <div className="flex items-center gap-3">
                {project.rank < 10 ? (
                  <span>
                    <img
                      src={
                        project.phase == ProjectPhase.PREMINT
                          ? "/images/Pre-mint_badge.png"
                          : "/images/post-mint_badge.png"
                      }
                      className="w-8 h-8"
                      alt=""
                      data-tip=""
                      data-for="trending"
                    />
                    <ReactTooltip
                      id="trending"
                      type="dark"
                      effect="solid"
                      getContent={() => {
                        return (
                          <div className="px-4 py-2 rounded-md">
                            <p className="text-grayc ">
                              This project is trending on the rankings! Must be
                              super duper cool.
                            </p>
                          </div>
                        );
                      }}
                    />
                  </span>
                ) : null}

                {project.discordInviteUrl ? (
                  <div
                    className="cursor-pointer z-5"
                    onClick={(e) => openUrl(e, project.discordInviteUrl)}
                  >
                    <SiDiscord className="h-4 w-4 text-white" />
                  </div>
                ) : null}

                {project.twitterUsername ? (
                  <div
                    className="cursor-pointer z-5"
                    onClick={(e) =>
                      openUrl(
                        e,
                        `https://twitter.com/${project.twitterUsername}`
                      )
                    }
                  >
                    <SiTwitter className="h-4 w-4 text-white" />
                  </div>
                ) : null}

                {variant === "all" && project.websiteUrl && (
                  <div
                    className="cursor-pointer z-5"
                    onClick={(e) => openUrl(e, project?.websiteUrl)}
                  >
                    <RxLink2 className="h-5 w-5" />
                  </div>
                )}
              </div>
            )}

            {project.allowlist && variant === "mine" && (
              <WhitelistStatusBadge
                project={project}
                status={
                  isAllowlistEnabled
                    ? isAllowlistObtained
                      ? "obtained"
                      : "pending"
                    : "closed"
                }
              />
            )}

            {featured ? (
              <span className="px-3 py-1 rounded-lg bg-primary-500 font-semibold mr-2">
                Featured
              </span>
            ) : null}
          </div>
        </Link>

        <Link
          href={
            {
              all: `/project/${project.slug}`,
              mine: `/project/${project.slug}`,
              owned: `/creator/project/${project.slug}`,
            }[variant]
          }
        >
          <div className="flex items-center px-4">
            <div className="relative">
              <img
                src={project.imageUrl ?? "/images/AvatarPlaceholder-1.png"}
                className="w-10 h-10 rounded-lg"
                alt=""
              />
              {project.verified ? (
                <span className="absolute -top-1 -right-1">
                  <img
                    src="/images/verified.svg"
                    alt="Verified"
                    data-tip=""
                    data-for="verified"
                  />
                  <ReactTooltip
                    id="verified"
                    type="dark"
                    effect="solid"
                    getContent={() => {
                      return (
                        <div className="px-4 py-2 rounded-md">
                          <p className="text-grayc ">
                            This project has been verified by the Blocksmith
                            Labs team.
                          </p>
                        </div>
                      );
                    }}
                  />
                </span>
              ) : null}
            </div>

            <p className="ml-3 text-lg font-semibold flex-1">{project.name}</p>
          </div>

          {project.phase === "PREMINT" && (
            <div className="flex justify-cetner place-items-end">
              {
                {
                  all: (
                    <div className="flex justify-between text-xs px-4 py-2 w-full gap-4">
                      <div className="">
                        <h3 className="text-gray-400">MINT DATE</h3>
                        <p className="font-semibold">
                          {project.mintDate
                            ? format(
                                Date.parse(project.mintDate.toString()),
                                "d MMM yyyy"
                              )
                            : "TBD"}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">SUPPLY</h3>
                        <p className="font-semibold">
                          {project.supply ?? "TBD"}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">MINT PRICE</h3>
                        <p className="font-semibold">
                          {project.mintPrice ? `${project.mintPrice}` : "TBD"}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">CHAIN</h3>
                        <p className="font-semibold flex items-center gap-1">
                          {project.network !== "TBD"
                            ? NetworkIcon[project.network]
                            : ""}
                          {project.network.substring(0, 3).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ),
                  owned: (
                    <div className="flex justify-between text-xs px-4 py-2 w-full gap-4">
                      <div className="">
                        <h3 className="text-gray-400">STATUS</h3>
                        <p className="font-semibold">{project.status}</p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">Network</h3>
                        <p className="font-semibold">
                          {project.network.substring(0, 3).toUpperCase()}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">MINT PRICE</h3>
                        {}
                        <p className="font-semibold ">
                          {project.mintPrice ? (
                            <p className="flex gap-1">
                              {project.mintPrice} {NetworkIcon[project.network]}
                            </p>
                          ) : (
                            "TBD"
                          )}
                        </p>
                      </div>
                      <div className="">
                        <h3 className="text-gray-400">Mint Date</h3>
                        <p className="font-semibold">
                          {project.mintDate ? (
                            <>
                              {format(
                                Date.parse(project.mintDate.toString()),
                                "d MMM yyyy"
                              )}
                            </>
                          ) : (
                            "TBD"
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                  mine: (
                    <div className="flex justify-between text-xs px-4 py-2 w-full gap-4">
                      <div className="">
                        <h3 className="text-gray-400">STATUS</h3>
                        <p className="font-semibold">
                          {project.status === ProjectStatus.PUBLISHED
                            ? "Live"
                            : ""}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">Network</h3>
                        <p className="font-semibold">
                          {project.network.substring(0, 3).toUpperCase()}
                        </p>
                      </div>

                      <div className="">
                        <h3 className="text-gray-400">MINT PRICE</h3>
                        {}
                        <p className="font-semibold ">
                          {project.mintPrice ? (
                            <p className="flex gap-1">
                              {project.mintPrice} {NetworkIcon[project.network]}
                            </p>
                          ) : (
                            "TBD"
                          )}
                        </p>
                      </div>
                      <div className="">
                        <h3 className="text-gray-400">Mint Date</h3>
                        <p className="font-semibold">
                          {project.mintDate ? (
                            <>
                              {format(
                                Date.parse(project.mintDate.toString()),
                                "d MMM yyyy"
                              )}
                            </>
                          ) : (
                            "TBD"
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                }[variant]
              }
            </div>
          )}
          {project.phase === "POSTMINT" && (
            <div className="px-4 mt-2 text-sm flex-1 flex justify-center text-left h-10 overflow-y-hidden">
              {project.description.length > 100
                ? project.description.substring(0, 100) + "..."
                : project.description}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};
