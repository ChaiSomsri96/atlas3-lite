import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { getTimeRemaining } from "@/frontend/utils/getTimeRemanining";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { GiveawayStatus } from "@prisma/client";
import Tippy from "@tippyjs/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { SiDiscord, SiTwitter } from "react-icons/si";

export const GiveawayInfo = ({ giveaway }: { giveaway: ExtendedGiveaway }) => {
  const [timeRemanining, setTimeRemaining] = useState(
    getTimeRemaining(giveaway.endsAt ? giveaway.endsAt : new Date())
  );

  // counter interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        getTimeRemaining(giveaway.endsAt ? giveaway.endsAt : new Date())
      );
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div>
      {/* ProjectImage */}
      <div className="flex">
        <img
          src={giveaway.project.imageUrl ?? "/images/AvatarPlaceholder-1.png"}
          alt=""
          className="h-16 w-16 rounded-lg border-2 border-dark-800"
        />
        {giveaway.collabProject && (
          <img
            src={
              giveaway.collabProject?.imageUrl ??
              "/images/AvatarPlaceholder-1.png"
            }
            alt=""
            className="h-16 w-16 rounded-lg border-2 border-dark-800 -ml-6"
          />
        )}
      </div>

      {/* Name and Network */}
      <div className="flex md:flex-row flex-col-reverse justify-between mt-6 w-full gap-4">
        <p className="text-2xl font-bold whitespace-pre-line break-all">
          {giveaway.name}
        </p>

        <div className="flex gap-4 items-center">
          <a
            href={giveaway?.project?.discordInviteUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            <SiDiscord className="h-6 w-6" />
          </a>
          <a
            href={
              giveaway.project?.twitterUsername
                ? `https://twitter.com/${giveaway?.project?.twitterUsername}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            <SiTwitter className="h-6 w-6" />
          </a>
          <Tippy content={giveaway.project.network} theme={"light"}>
            {NetworkIcon[giveaway.project.network]}
          </Tippy>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:flex text-sm gap-4 sm:gap-16">
        {giveaway.collabProjectId && giveaway.collabProject && (
          <div>
            <h3 className="text-gray-400 text-xs">FOR</h3>
            <p className="font-semibold">
              {giveaway.collabType === "RECEIVE_SPOTS"
                ? giveaway.collabProject.name
                : giveaway.project.name}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-gray-400 text-xs">TYPE</h3>
          <p className="font-semibold">
            {giveaway.type === "RAFFLE" ? "Raffle" : "FCFS"}
          </p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">WINNERS</h3>
          <p className="font-semibold">{giveaway.maxWinners}</p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">
            {giveaway.status === GiveawayStatus.RUNNING
              ? "ENDS AT"
              : "ENDED AT"}
          </h3>
          <p className="font-semibold">
            {giveaway.status === GiveawayStatus.RUNNING ? (
              <>{giveaway.endsAt ? timeRemanining : "-"}</>
            ) : (
              <>
                {giveaway.endsAt
                  ? format(
                      Date.parse(giveaway.endsAt.toString()),
                      "d MMM yyyy HH:mm"
                    )
                  : "-"}
              </>
            )}
          </p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">ENTRIES</h3>
          <p className="font-semibold">{giveaway.entryCount}</p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">INTEREST</h3>
          <p className="font-semibold">
            {(giveaway.entryCount ?? 0) > 0 ? "🔥" : ""}{" "}
            {(giveaway.entryCount ?? 0) > 100 ? "🔥" : ""}{" "}
            {(giveaway.entryCount ?? 0) > 200 ? "🔥" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};
