import { ProjectPhase } from "@prisma/client";
import { MouseEvent } from "react";
import { SiDiscord, SiTwitter } from "react-icons/si";
import ReactTooltip from "react-tooltip";
import { MarketplaceProjectListingData } from "@/pages/api/me/marketplace/projects-listings";

export const ProjectListingCard = ({
  record,
  setActiveProjectId,
}: {
  record: MarketplaceProjectListingData;
  setActiveProjectId: (id: string) => void;
}) => {
  const openUrl = (e: MouseEvent, url: string | null) => {
    e.stopPropagation();
    e.preventDefault();

    if (url) window.open(url, "_blank");
  };

  return (
    <div className="relative w-full h-40 rounded-lg  hover:shadow-[0px_0px_24px_5px_rgba(0,133,234,0.25)] hover:outline outline-primary-500 cursor-pointer">
      <img
        src={record.project.bannerUrl ?? "/images/Placeholder-2.png"}
        alt="Project Image"
        className="absolute w-full h-full object-cover -z-10 rounded-lg"
      />

      <div className="absolute bg-gradient-to-t from-dark-800  to-transparent  w-full h-40 -z-10 rounded-lg" />
      <div className="absolute bg-dark-800 opacity-50  w-full h-40 -z-10 rounded-lg" />

      <div className="flex flex-col justify-between w-full h-full pt-3 pb-2 -z-0">
        <div
          onClick={() => {
            setActiveProjectId(record.project.id);
          }}
          className="flex-1"
        >
          <div className="flex mx-4 items-center justify-between">
            {
              <div className="flex items-center gap-3">
                {record.project.rank < 10 ? (
                  <span>
                    <img
                      src={
                        record.project.phase == ProjectPhase.PREMINT
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

                {record.project.discordInviteUrl ? (
                  <div
                    className="cursor-pointer z-5"
                    onClick={(e) => openUrl(e, record.project.discordInviteUrl)}
                  >
                    <SiDiscord className="h-4 w-4 text-white" />
                  </div>
                ) : null}

                {record.project.twitterUsername ? (
                  <div
                    className="cursor-pointer z-5"
                    onClick={(e) =>
                      openUrl(
                        e,
                        `https://twitter.com/${record.project.twitterUsername}`
                      )
                    }
                  >
                    <SiTwitter className="h-4 w-4 text-white" />
                  </div>
                ) : null}
              </div>
            }
          </div>
        </div>

        <div
          onClick={() => {
            setActiveProjectId(record.project.id);
          }}
        >
          <div className="flex items-center px-4">
            <div className="relative">
              <img
                src={
                  record.project.imageUrl ?? "/images/AvatarPlaceholder-1.png"
                }
                className="w-10 h-10 rounded-lg"
                alt=""
              />
              {record.project.verified ? (
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

            <p className="ml-3 text-lg font-semibold flex-1">
              {record.project.name}
            </p>
          </div>
          <div className="flex justify-cetner place-items-end">
            <div className="flex justify-between text-xs px-4 py-2 w-full gap-4">
              <div className="">
                <h3 className="text-gray-400">Lowest Price</h3>
                <p className="font-semibold flex items-center">
                  {record.floorPrice && record.floorPrice > 0
                    ? `${record.floorPrice / 1000}`
                    : "N/A"}
                  {record.floorPrice && (
                    <img
                      src="/images/Atlas3Points.png"
                      className="w-3 h-3 ml-1 "
                      alt="lowestprice"
                    />
                  )}
                </p>
              </div>
              <div className="">
                <h3 className="text-gray-400">24hr Vol</h3>
                <p className="font-semibold flex items-center">
                  {record.volume && record.volume > 0
                    ? `${record.volume / 1000}`
                    : "N/A"}
                  {record.volume && record.volume > 0 ? (
                    <img
                      src="/images/Atlas3Points.png"
                      className="w-3 h-3 ml-1 "
                      alt="vol"
                    />
                  ) : (
                    ""
                  )}
                </p>
              </div>

              <div className="">
                <h3 className="text-gray-400">Listings</h3>
                <p className="font-semibold">{record.openListings}</p>
              </div>
              <div className="">
                <h3 className="text-gray-400">Buy Orders</h3>
                <p className="font-semibold">{record.openBuyOrders}</p>
              </div>
              <div className="">
                <h3 className="text-gray-400">Last Sale</h3>
                <p className="font-semibold flex items-center">
                  {record.lastSale && record.lastSale > 0
                    ? `${record.lastSale / 1000}`
                    : "N/A"}
                  {record.lastSale && record.lastSale > 0 ? (
                    <img
                      src="/images/Atlas3Points.png"
                      className="w-3 h-3 ml-1 "
                      alt="lastsale"
                    />
                  ) : (
                    ""
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
