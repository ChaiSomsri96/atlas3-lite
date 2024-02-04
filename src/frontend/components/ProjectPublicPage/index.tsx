import { useProject } from "@/frontend/hooks/useProject";
import { Listbox, Menu, Popover, Tab, Transition } from "@headlessui/react";
import Tippy from "@tippyjs/react";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { BsQuestionSquareFill } from "react-icons/bs";
import { RxArrowRight, RxCheck, RxLink2 } from "react-icons/rx";
import { SiDiscord, SiTwitter } from "react-icons/si";
import Button from "../Button";
import Drawer from "../Drawer";
import PublicLayout from "../Layout/PublicLayout";
// import {
//   MintDetailsForm,
//   ProjectDetailsForm,
//   GiveawayDetailsForm,
//   EntryRequirementsForm,
// } from "./Forms";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { BlockchainNetwork, ProjectPhase, Wallet } from "@prisma/client";
// import Stepper from "../Stepper";
import { RxChevronDown } from "react-icons/rx";
import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { shortenPublicKey } from "@/shared/utils";
import { useAvailableRoles } from "@/frontend/hooks/useAvailableRoles";
import { useHandleObtainRole } from "@/frontend/handlers/useHandleObtainRole";
import { useSession } from "next-auth/react";
import { RequestCollab } from "@/shared/types";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
import { useProfileSlideoverProvider } from "@/frontend/contexts/ProfileSlideoverProvider";
import { format } from "date-fns";
import { CreateCollabPublic } from "../CreateCollabPublic";
import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { Loader } from "../Loader";
import ReactTooltip from "react-tooltip";
import clsx from "clsx";
import { JoinedGiveawaysTab } from "./JoinedGiveawaysTab";
import { PastGiveawaysTab } from "./PastGiveawaysTab";
import { RunningGiveawaysTab } from "./RunningGiveawaysTab";

export const AvailableRoles = ({ project }: { project: ExtendedProject }) => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [obtaining, setObtaining] = useState(false);
  const handleObtainRole = useHandleObtainRole(setObtaining);
  const { data: availableRoles, isLoading: isAvailableRolesFetching } =
    useAvailableRoles({ project });

  const { data: userDetails } = useUserDetails();

  const walletMap = userDetails?.wallets?.reduce((acc, wallet) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }

    acc[wallet.network].push(wallet);

    return acc;
  }, {} as Record<BlockchainNetwork, typeof userDetails.wallets>);

  const networkWallets = walletMap?.[project?.network as BlockchainNetwork];
  const defaultWallet = networkWallets?.find((wallet) => wallet.isDefault);

  useEffect(() => {
    if (defaultWallet) {
      setSelectedWallet(defaultWallet);
    }
  }, [defaultWallet]);

  const { setOpen: setProfileOpen } = useProfileSlideoverProvider();

  const handleSetSelectedWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    if (
      project &&
      project.allowlist?.entries?.length &&
      wallet &&
      project.allowlist.entries[0].role &&
      obtainedRole &&
      obtainedRole.role &&
      !obtaining
    ) {
      handleObtainRole.mutate({
        project,
        wallet,
        role: obtainedRole.role,
      });
    }
  };

  const obtainedRole = project?.allowlist?.entries?.find(
    (entry) => entry.userId === userDetails?.id
  );

  if (!project) {
    return (
      <p className="font-semibold text-base leading-6">No roles available</p>
    );
  } else {
    return (
      <div className=" bg-neutral-900 border-[1.5px] border-solid border-primary-700 border-opacity-50 shadow-3xl rounded-2xl px-3 py-4 mt-2 mx-auto sm:w-[347px] max-w-sm">
        <div className="flex justify-between items-center">
          <p className="leading-5 text-lg font-semibold mt-1">
            Minting wallet:
          </p>

          {networkWallets?.length ? (
            <Listbox value={selectedWallet} onChange={handleSetSelectedWallet}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg  pr-8 text-left shadow-md sm:text-sm bg-dark-600 px-3 py-1">
                  <span className="block truncate">
                    {obtainedRole
                      ? shortenPublicKey(obtainedRole.walletAddress)
                      : selectedWallet?.address
                      ? shortenPublicKey(selectedWallet?.address)
                      : "Select wallet"}
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
                  <Listbox.Options className="absolute mt-1 w-56 max-h-60 overflow-auto rounded-md bg-dark-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {networkWallets?.map((wallet, walletIdx) => {
                      let selected = false;
                      if (obtainedRole) {
                        selected =
                          obtainedRole.walletAddress === wallet.address;
                      }
                      return (
                        <Listbox.Option
                          key={`wallet-${walletIdx}-${wallet.address}`}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 mx-1 rounded-lg ${
                              active
                                ? "bg-gray-500 text-gray-100"
                                : "text-gray-200"
                            }`
                          }
                          value={wallet}
                        >
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {shortenPublicKey(wallet.address)}
                              {defaultWallet?.address === wallet.address
                                ? " (Primary)"
                                : ""}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-400">
                                <RxCheck
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        </Listbox.Option>
                      );
                    })}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          ) : (
            <p
              className="text-sm hover:cursor-pointer"
              onClick={() => {
                setProfileOpen(true);
              }}
            >
              Add new wallet
              <RxArrowRight
                className="inline-flex h-4 w-4 ml-1 text-gray-400"
                aria-hidden="true"
              />
            </p>
          )}
        </div>

        {isAvailableRolesFetching ? (
          <div className="mt-2 space-y-2">
            <div className="w-full h-10 bg-gray-700 rounded-lg" />
            <div className="w-full h-10 bg-gray-700 rounded-lg" />
          </div>
        ) : (
          <>
            {availableRoles?.length === 0 ? (
              <p className="font-semibold text-base leading-6 mt-2">
                You are not eligible to obtain any roles.
              </p>
            ) : (
              <>
                {availableRoles?.map((role, index) => (
                  <div
                    className={`flex items-center justify-between mt-6  ${
                      obtainedRole && obtainedRole?.role?.id === role.id
                        ? ""
                        : obtaining
                        ? ""
                        : "hover:cursor-pointer"
                    }

                      `}
                    key={index}
                    onClick={() => {
                      if (
                        (!obtainedRole || obtainedRole?.role?.id !== role.id) &&
                        !obtaining
                      ) {
                        handleObtainRole.mutate({
                          role,
                          wallet: selectedWallet,
                          project,
                        });
                      }
                    }}
                  >
                    <h3 className="font-semibold text-base leading-6">
                      Obtain the{" "}
                      <span className="text-primary-600">{role.name}</span>{" "}
                      Discord Role
                    </h3>
                    {obtainedRole && obtainedRole?.role?.id === role.id ? (
                      <div className="flex justify-center items-center h-8 w-8 bg-green-700 rounded-lg">
                        <RxCheck className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-8 w-8 bg-primary-500 rounded-lg">
                        <RxArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    );
  }
};

export default function ProjectPublicPage() {
  const router = useRouter();
  const { projectSlug } = router.query;
  const { data: project, isLoading: loadingProject } = useProject({
    slug: projectSlug as string,
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rcFlow, setRCFlow] = useState<boolean>(false); // Set flag for Request Collaboration flow
  // const [activeStep, setActiveStep] = useState<number>(0);
  const { data: session } = useSession();
  const { data: userDetails } = useUserDetails();
  // const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const descriptionRef = useRef<HTMLSpanElement>(null);
  const [isClamped, setClamped] = useState(false);

  const [requestCollab] = useState<RequestCollab>();
  console.log(requestCollab);

  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabName = useMemo(() => {
    if (tabIndex == 0) {
      return "Running";
    } else if (tabIndex == 1) {
      return session ? "Joined" : "Past";
    } else if (tabIndex == 2) {
      return "Past";
    }
  }, [session, tabIndex]);

  useEffect(() => {
    // Function that should be called on window resize
    function handleResize() {
      if (descriptionRef && descriptionRef.current) {
        setClamped(
          descriptionRef.current.scrollHeight >
            descriptionRef.current.clientHeight
        );
      }
    }

    handleResize();

    // Add event listener to window resize
    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that it would only run on mount

  // const validationSchema = Yup.object().shape({
  //   name: Yup.string().required("Project name is required"),
  //   description: Yup.string()
  //     .required("Description is required")
  //     .min(6, "Description must be at least 50 characters"),
  // });

  // const methods = useForm<RequestCollab>({
  //   resolver: yupResolver(validationSchema),
  // });

  const obtainedRole = project?.allowlist?.entries?.find(
    (entry) => entry.userId === userDetails?.id
  );

  const handleReadMore = () => {
    setRCFlow(false);
    setIsOpen(true);
  };

  // const NavigateSteps = () => {
  //   return (
  //     <div className="flex justify-end gap-[6px] mb-5">
  //       <button
  //         type="button"
  //         className="font-bold bg-transparent text-sm leading-4 border-primary-500 text-primary-500 px-[18px] py-[15.5px] border-[1px] rounded-xl"
  //         onClick={() => validateStep(methods.getValues(), "DECREMENT")}
  //       >
  //         Previous Step
  //       </button>
  //       <button
  //         type="button"
  //         className="font-bold bg-transparent text-sm leading-4 border-primary-500 text-primary-500 px-[18px] py-[15.5px] border-[1px] rounded-xl"
  //         onClick={() => validateStep(methods.getValues(), "INCREMENT")}
  //       >
  //         Next Step
  //       </button>
  //       <button
  //         type="submit"
  //         className={`${
  //           !isFormValid
  //             ? "font-bold bg-transparent text-sm leading-4 bg-neutral-200 text-neutral-500 px-[18px] py-[15.5px] border-[1px] rounded-xl"
  //             : "font-bold text-sm leading-4 text-neutral-50 bg-primary-500 px-[18px] py-[15.5px] rounded-xl"
  //         } `}
  //         disabled={!isFormValid}
  //       >
  //         Send Request
  //       </button>
  //     </div>
  //   );
  // };

  // type STEP_TYPE = "INCREMENT" | "DECREMENT";

  // const validateStep = (data: RequestCollab, stepType: STEP_TYPE) => {
  //   console.log("data :>> ", data);

  //   const keys = Object.keys(data);

  //   const isValid = keys.every(
  //     (key) => data[key as keyof RequestCollab] !== ""
  //   );

  //   if (!isValid) {
  //     setIsFormValid(false);
  //     toast.error("Please fill all the fields");
  //     return;
  //   }

  //   setIsFormValid(true);

  //   // switch (activeStep) {
  //   //   case 0:
  //   //     setCollabProjDetails(data);
  //   //     break;
  //   //   case 1:
  //   //     setCollabMintDetails(data);
  //   //     break;
  //   //   case 2:
  //   //     setCollabGiveawayDetails(data);
  //   //     break;
  //   //   default:
  //   //     break;
  //   // }

  //   setRequestCollab(data);

  //   handleStepChange(stepType);
  // };

  // const handleStepChange = (stepType: STEP_TYPE) => {
  //   if (stepType === "INCREMENT") {
  //     setActiveStep((current) => (current < 3 ? current + 1 : current));
  //   } else if (stepType === "DECREMENT") {
  //     setActiveStep((current) => (current > 0 ? current - 1 : current));
  //   }
  // };

  // const RequestCollabForm = () => {
  //   return (
  //     <FormProvider {...methods}>
  //       <form
  //         onSubmit={methods.handleSubmit((data) =>
  //           validateStep(data, "INCREMENT")
  //         )}
  //       >
  //         <h2 className="text-sm leading-[17px] text-neutral-200">
  //           If you would like to provide {project?.name} with whitelist spots,
  //           please fill out this form.
  //         </h2>

  //         <Stepper
  //           steps={[
  //             "Project Details",
  //             "Mint Details",
  //             "Giveaway Details",
  //             "Entry Requirements",
  //           ]}
  //           activeStep={activeStep}
  //         />

  //         <p className="text-sm leading-[17px] text-neutral-200 mt-5">
  //           Please note that all fields are required.
  //         </p>

  //         {activeStep === 0 && <ProjectDetailsForm />}
  //         {activeStep === 1 && <MintDetailsForm />}
  //         {activeStep === 2 && <GiveawayDetailsForm />}
  //         {activeStep === 3 && <EntryRequirementsForm />}

  //         <div className="border-[0.6px] border-neutral-700 w-full mt-8 mb-3" />
  //         <NavigateSteps />
  //       </form>
  //     </FormProvider>
  //   );
  // };

  if (loadingProject) {
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );
  }

  if (!project) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col justify-center items-center gap-3">
            <BsQuestionSquareFill className="h-12 w-12 text-gray-200 text-center" />
            <p className="text-gray-200 text-2xl font-semibold">
              Project not found
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout
      backgroundImageSrc={project?.bannerUrl ?? "/images/Placeholder-2.png"}
    >
      {!rcFlow && (
        <Drawer
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title="Project Details"
          description={project?.description}
        ></Drawer>
      )}

      {rcFlow && (
        <Drawer
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          title="Request Collaboration"
        >
          <CreateCollabPublic mode="create" />
        </Drawer>
      )}

      <div className="flex sm:flex-row flex-col sm:justify-between justify-start gap-4 items-center">
        {/* Project Name and Image */}
        <div className="flex gap-4 items-center">
          <div className="relative">
            <img
              src={project.imageUrl ?? "/images/AvatarPlaceholder-1.png"}
              className="w-20 h-20 rounded-lg"
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
                          This project has been verified by the Blocksmith Labs
                          team.
                        </p>
                      </div>
                    );
                  }}
                />
              </span>
            ) : null}
          </div>
          <div className="space-y-1">
            <Tippy content={`${project?.network}`} theme={"light"}>
              {NetworkIcon[project?.network as BlockchainNetwork]}
            </Tippy>

            <p className="text-gray-200 text-2xl font-semibold">
              {project?.name}
            </p>
          </div>
        </div>

        {/* Wallet Submission and Socials*/}
        <div className="flex sm:flex-row flex-col gap-4 items-center sm:w-fit w-full">
          <div className="flex gap-4 items-center justify-center sm:w-fit w-full">
            {project.rank < 10 ? (
              <img
                src={
                  project.phase == ProjectPhase.PREMINT
                    ? "/images/Pre-mint_badge.png"
                    : "/images/post-mint_badge.png"
                }
                className="w-7 h-7"
                alt=""
              />
            ) : null}

            <a
              href={project?.discordInviteUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              <SiDiscord className="h-6 w-6" />
            </a>
            <a
              href={
                project?.twitterUsername
                  ? `https://twitter.com/${project?.twitterUsername}`
                  : "#"
              }
              target="_blank"
              rel="noreferrer"
            >
              <SiTwitter className="h-6 w-6" />
            </a>
            <a
              href={project?.websiteUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              <RxLink2 className="h-6 w-6" />
            </a>
          </div>

          {session && (
            <>
              {project.allowlist &&
                project.allowlist.enabled &&
                !loadingProject && (
                  <Popover className="relative sm:w-fit w-full">
                    <Popover.Button
                      className={`flex gap-2 items-center rounded-lg border border-transparent px-4 py-2 mx-auto text-sm font-medium ${
                        obtainedRole ? "bg-green-700" : "bg-primary-500"
                      }`}
                    >
                      {obtainedRole ? (
                        <>
                          Obtained with{" "}
                          {shortenPublicKey(obtainedRole.walletAddress)}
                        </>
                      ) : (
                        <>Obtain Allowlist</>
                      )}
                    </Popover.Button>
                    <Popover.Panel className="absolute top-12 sm:left-auto left-0 right-0 z-10">
                      <AvailableRoles project={project} />
                    </Popover.Panel>
                  </Popover>
                )}

              {project.allowlist && !project.allowlist.enabled && (
                <>
                  {obtainedRole ? (
                    <div>
                      <div className="py-1 px-2 bg-green-500 rounded-lg">
                        <p className="text-sm">
                          Obtained with{" "}
                          {shortenPublicKey(obtainedRole.walletAddress)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="py-1 px-2 bg-gray-500 rounded-lg">
                        <p className="text-sm">Allowlist Claiming Disabled</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info  */}
      <div className="mt-6 max-w-5xl text-sm">
        <h3 className="text-gray-400 text-xs">ABOUT</h3>
        <p>
          <span className="line-clamp-2" ref={descriptionRef}>
            {project?.description}
          </span>
          {isClamped ? (
            <span
              className="text-primary-400 underline hover:cursor-pointer"
              onClick={handleReadMore}
            >
              Read more...
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-6 grid sm:grid-cols-4 grid-cols-2 text-sm gap-4">
        <div>
          <h3 className="text-gray-400 text-xs">GIVEAWAYS</h3>
          <p className="font-semibold">{project?.giveawaysCount ?? 0}</p>
        </div>
        <div>
          <h3 className="text-gray-400 text-xs">Network</h3>
          <p className="font-semibold">{project?.network}</p>
        </div>

        {project && project.phase === "PREMINT" && (
          <>
            <div>
              <h3 className="text-gray-400 text-xs">MINT DATE</h3>
              <p className="font-semibold">
                {project?.mintDate
                  ? `${format(
                      Date.parse(project.mintDate.toString()),
                      "dd EEE"
                    )}${project.mintTime ? `, ${project.mintTime}` : ""}`
                  : "TBD"}
              </p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs">SUPPLY</h3>
              <p className="font-semibold">{project?.supply ?? "TBD"}</p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs">MINT PRICE</h3>
              <p className="font-semibold">{project?.mintPrice ?? "TBD"}</p>
            </div>

            <div>
              <h3 className="text-gray-400 text-xs">OBTAINED WALLETS</h3>
              <p className="font-semibold">{project.allowlistCount}</p>
            </div>
          </>
        )}
      </div>

      {/* Giveaways */}
      <div className="mt-12">
        <Tab.Group defaultIndex={0} selectedIndex={tabIndex}>
          <div className="flex flex-row gap-2 justify-between items-center">
            <div className="md:block hidden">
              <Tab.List className="bg-dark-600 flex justify-between rounded-lg p-1 sm:w-fit w-full gap-y-2">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`${
                        selected && "bg-primary-500"
                      }  py-1 px-3 rounded-lg`}
                      onClick={() => setTabIndex(0)}
                    >
                      Running Giveaways
                    </button>
                  )}
                </Tab>

                {session ? (
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-1 px-3 rounded-lg`}
                        onClick={() => setTabIndex(1)}
                      >
                        Joined Giveaways
                      </button>
                    )}
                  </Tab>
                ) : null}

                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`${
                        selected && "bg-primary-500"
                      }  py-1 px-3 rounded-lg`}
                      onClick={() => setTabIndex(session ? 2 : 1)}
                    >
                      Past Giveaways
                    </button>
                  )}
                </Tab>
              </Tab.List>
            </div>
            <div className="md:hidden block">
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium bg-primary-500 text-white">
                  {tabName}
                  <RxChevronDown
                    className="-mr-1 ml-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-10 mt-2 origin-top-right rounded-lg bg-dark-600 shadow-lg">
                    <div className="py-1 justify-start items-center w-full">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-dark-500 text-gray-100"
                                : "text-gray-200",
                              "px-4 py-3 text-sm rounded-lg mx-1 w-full text-left"
                            )}
                            onClick={() => setTabIndex(0)}
                          >
                            Running
                          </button>
                        )}
                      </Menu.Item>
                      {session ? (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={clsx(
                                active
                                  ? "bg-dark-500 text-gray-100"
                                  : "text-gray-200",
                                "px-4 py-3 text-sm rounded-lg mx-1 w-full text-left"
                              )}
                              onClick={() => setTabIndex(1)}
                            >
                              Joined
                            </button>
                          )}
                        </Menu.Item>
                      ) : null}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-dark-500 text-gray-100"
                                : "text-gray-200",
                              "px-4 py-3 text-sm rounded-lg mx-1 w-full text-left"
                            )}
                            onClick={() => setTabIndex(session ? 2 : 1)}
                          >
                            Past
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <div className="md:w-fit w-full text-right">
              <Button
                variant="outline"
                setRCFlow={setRCFlow}
                setIsOpen={setIsOpen}
              >
                Request Collaboration
              </Button>
            </div>
          </div>
          <Tab.Panels>
            <Tab.Panel className="mt-3" tabIndex={0}>
              <RunningGiveawaysTab projectSlug={projectSlug as string} />
            </Tab.Panel>
            {session ? (
              <Tab.Panel className="mt-3" tabIndex={1}>
                <JoinedGiveawaysTab projectSlug={projectSlug as string} />
              </Tab.Panel>
            ) : null}
            <Tab.Panel className="mt-3">
              <PastGiveawaysTab projectSlug={projectSlug as string} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </PublicLayout>
  );
}
