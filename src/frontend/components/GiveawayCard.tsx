import { NetworkIcon } from "@/shared/getNetworkIcon";
import { BlockchainNetwork, GiveawayStatus } from "@prisma/client";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { HiCheck } from "react-icons/hi";
import { ExtendedGiveaway } from "../hooks/useGiveaway";

export const GiveawayCard = ({
  giveaway,
  variant,
}: {
  giveaway: ExtendedGiveaway;
  variant: "own" | "all";
}) => {
  const [giveawayStatus, setGiveawayStatus] = useState<string>("");

  useEffect(() => {
    if (variant == "own") {
      if (giveaway.status == GiveawayStatus.RUNNING) {
        setGiveawayStatus("running");
      } else if (giveaway.status == GiveawayStatus.FINALIZED) {
        if (giveaway?.entries.length > 0) {
          const winEntry = giveaway.entries?.filter((entry) => entry.isWinner);
          if (winEntry && winEntry.length > 0) {
            setGiveawayStatus("won");
          } else {
            setGiveawayStatus("lost");
          }
        }
      }
    }
  }, []);

  return (
    <Link
      href={
        giveaway.adminCreated
          ? `/raffles`
          : `/project/${giveaway?.project?.slug}/giveaway/${giveaway.slug}`
      }
      target="_blank"
    >
      <div className="relative w-full h-40 rounded-lg  hover:shadow-[0px_0px_24px_5px_rgba(0,133,234,0.25)] hover:outline outline-primary-500 cursor-pointer">
        <div className="relative w-full h-40 rounded-lg">
          <img
            src={giveaway.bannerUrl ?? "/images/Placeholder-2.png"}
            alt="Project Image"
            className="absolute w-full h-full object-cover -z-10 rounded-lg"
          />

          <div className="absolute bg-gradient-to-t from-dark-800  to-transparent  w-full h-40 -z-10 rounded-lg" />
          <div className="absolute bg-dark-800 opacity-50  w-full h-40 -z-10 rounded-lg" />

          <div className="flex flex-col justify-between w-full h-full pt-3 pb-2">
            <div className="flex mx-3 items-center justify-between">
              <p className="ml-3 text-lg font-semibold truncate">
                {giveaway.name}
              </p>
              {variant == "own" ? (
                <>
                  {giveawayStatus == "running" ? (
                    <>
                      {giveaway?.entries && giveaway?.entries?.length > 0 ? (
                        <span className="px-4 py-1 bg-success-500 rounded-lg flex gap-2 items-center">
                          <HiCheck />
                          Registered
                        </span>
                      ) : (
                        ""
                      )}
                    </>
                  ) : giveawayStatus == "won" ? (
                    <span className="px-4 py-1 bg-success-500 rounded-lg flex gap-2 items-center">
                      <FaCircle size={12} />
                      Won
                    </span>
                  ) : giveawayStatus == "lost" ? (
                    <span className="px-4 py-1 bg-error-500 rounded-lg flex gap-2 items-center">
                      <FaCircle size={12} />
                      Lost
                    </span>
                  ) : (
                    ""
                  )}
                </>
              ) : null}
            </div>

            <div className="flex justify-between text-xs px-4 py-2 w-full gap-4 uppercase">
              <div className="flex">
                {giveaway.project?.imageUrl && (
                  <img
                    src={giveaway.project.imageUrl}
                    className="w-7 h-7 rounded-md"
                    alt=""
                  />
                )}
                {giveaway.collabProject && (
                  <img
                    src={
                      giveaway.collabProject.imageUrl ??
                      "/images/AvatarPlaceholder-1.png"
                    }
                    className={`${
                      giveaway.collabProject?.imageUrl ? "-ml-2" : ""
                    } w-7 h-7 rounded-md`}
                    alt=""
                  />
                )}
              </div>

              <div className="">
                <h3 className="text-gray-400">Spots</h3>
                <p className="font-semibold">{giveaway.maxWinners ?? "TBD"}</p>
              </div>

              <div className="">
                <h3 className="text-gray-400">Entries</h3>
                <p className="font-semibold">{giveaway.entryCount}</p>
              </div>

              <div className="">
                <h3 className="text-gray-400">
                  {giveaway.status === GiveawayStatus.RUNNING
                    ? "Ends in"
                    : "Ended"}
                </h3>
                <p className="font-semibold">
                  {giveaway.endsAt
                    ? formatDistance(new Date(giveaway.endsAt), new Date())
                    : "TBD"}{" "}
                  {giveaway.status === GiveawayStatus.FINALIZED ? "AGO" : ""}
                </p>
              </div>

              <div className="">
                <h3 className="text-gray-400">CHAIN</h3>
                <p className="font-semibold flex items-center gap-1">
                  {NetworkIcon[giveaway.network ?? BlockchainNetwork.Solana]}
                  {giveaway?.network?.substring(0, 3) ??
                    BlockchainNetwork.Solana}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
