import Tippy from "@tippyjs/react";
import { MouseEvent } from "react";
import { BsCheck, BsThreeDots } from "react-icons/bs";
import { SiDiscord, SiTwitter } from "react-icons/si";
import ReactTooltip from "react-tooltip";

const openUrl = (e: MouseEvent, url: string | null) => {
  e.stopPropagation();
  e.preventDefault();

  if (url) window.open(url, "_blank");
};

const WhitelistStatusBadge = ({
  status,
  setCreateApplication,
}: {
  status: "APPROVED" | "PENDING" | "none" | "DRAFT" | "REJECTED";
  setCreateApplication: (value: boolean) => void;
}) => {
  if (
    status === "PENDING" ||
    status === "APPROVED" ||
    status === "none" ||
    status === "DRAFT" ||
    status === "REJECTED"
  ) {
    return (
      <div>
        <div
          className={`flex justify-center items-center rounded-md ${
            {
              APPROVED: "bg-green-500",
              none: "bg-primary-500",
              PENDING: "bg-orange-500",
              DRAFT: "bg-primary-500",
              REJECTED: "bg-orange-500",
            }[status]
          }`}
        >
          {
            {
              APPROVED: (
                <div className="flex bg-green-600 text-sm rounded-md items-center gap-1 py-1 px-2 cursor-default">
                  <BsCheck className="w-5 h-5" />
                  Application Approved
                </div>
              ),
              none: (
                <div
                  className="flex bg-primary-500 text-sm rounded-md items-center gap-2 py-1 px-2 cursor-pointer"
                  onClick={() => {
                    setCreateApplication(true);
                  }}
                >
                  <div className="rounded-full w-2 h-2 bg-white animate-ping" />
                  Create Application
                </div>
              ),
              PENDING: (
                <div className="flex bg-orange-500 text-sm rounded-md items-center gap-1 py-1 px-2 cursor-default">
                  <div className="rounded-full w-3 h-3 bg-white animate-pulse" />
                  Application Pending
                </div>
              ),
              REJECTED: (
                <div className="flex bg-orange-500 text-sm rounded-md items-center gap-1 py-1 px-2 cursor-default">
                  <div className="rounded-full w-3 h-3 bg-white animate-pulse" />
                  Application Pending
                </div>
              ),
              DRAFT: (
                <div
                  className="flex bg-orange-500 text-sm rounded-md items-center gap-1 py-1 px-2 cursor-pointer"
                  onClick={() => {
                    setCreateApplication(true);
                  }}
                >
                  <div className="rounded-full w-3 h-3 bg-white animate-pulse" />
                  Continue Application
                </div>
              ),
            }[status]
          }
        </div>
      </div>
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

export const MeegosCard = ({
  setCreateApplication,
  status,
}: {
  setCreateApplication: (value: boolean) => void;
  status: "APPROVED" | "PENDING" | "none" | "DRAFT" | "REJECTED";
}) => {
  return (
    <div className="relative w-full md:w-1/3 min-w-[350px] md:min-w-[400px] h-40 rounded-lg  hover:shadow-[0px_0px_24px_5px_rgba(0,133,234,0.25)] hover:outline outline-primary-500">
      <img
        src="https://atlas3-public.s3.us-east-1.amazonaws.com/next-s3-uploads/f6a2aa47-cfc7-461a-a3fe-620867ddea6e/meegos-banner.jpeg"
        alt="Project Image"
        className="absolute w-full h-full object-cover -z-10 rounded-lg"
      />

      <div className="absolute bg-gradient-to-t from-dark-800  to-transparent  w-full h-40 -z-10 rounded-lg" />
      <div className="absolute bg-dark-800 opacity-50  w-full h-40 -z-10 rounded-lg" />

      <div className="flex flex-col justify-between w-full h-full pt-3 pb-2 -z-0">
        <div className="flex-1">
          <div className="flex mx-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="cursor-pointer z-5"
                onClick={(e) => openUrl(e, "https://discord.gg/meegos")}
              >
                <SiDiscord className="h-4 w-4 text-white" />
              </div>

              <div
                className="cursor-pointer z-5"
                onClick={(e) => openUrl(e, `https://twitter.com/meegosNFT`)}
              >
                <SiTwitter className="h-4 w-4 text-white" />
              </div>
            </div>

            <WhitelistStatusBadge
              status={status}
              setCreateApplication={setCreateApplication}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center px-4">
            <div className="relative">
              <img
                src="https://atlas3-public.s3.us-east-1.amazonaws.com/next-s3-uploads/f394cb42-c9e2-4f89-92dd-160b9408c9e9/meegos-pfp.jpeg"
                className="w-10 h-10 rounded-lg"
                alt=""
              />
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
            </div>

            <p className="ml-3 text-lg font-semibold">meegos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
