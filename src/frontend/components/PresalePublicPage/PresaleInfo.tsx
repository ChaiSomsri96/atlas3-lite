import { ExtendedPresale } from "@/frontend/hooks/usePresale";
import { getTimeRemaining } from "@/frontend/utils/getTimeRemanining";
import { NetworkIcon } from "@/shared/getNetworkIcon";
import { GiveawayStatus, PresaleStatus } from "@prisma/client";
import Tippy from "@tippyjs/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { SiDiscord, SiTwitter } from "react-icons/si";

export const PresaleInfo = ({ presale }: { presale: ExtendedPresale }) => {
  const [timeRemanining, setTimeRemaining] = useState(
    getTimeRemaining(presale.endsAt ? presale.endsAt : new Date())
  );

  // counter interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        getTimeRemaining(presale.endsAt ? presale.endsAt : new Date())
      );
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div>
      {/* ProjectImage */}
      <div className="flex">
        <img
          src={presale.project.imageUrl ?? "/images/AvatarPlaceholder-1.png"}
          alt=""
          className="h-16 w-16 rounded-lg border-2 border-dark-800"
        />
      </div>

      {/* Name and Network */}
      <div className="flex md:flex-row flex-col-reverse justify-between mt-6 w-full gap-4">
        <p className="text-2xl font-bold whitespace-pre-line break-all">
          {presale.name}
        </p>

        <div className="flex gap-4 items-center">
          <a
            href={presale?.project?.discordInviteUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            <SiDiscord className="h-6 w-6" />
          </a>
          <a
            href={
              presale.project?.twitterUsername
                ? `https://twitter.com/${presale?.project?.twitterUsername}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            <SiTwitter className="h-6 w-6" />
          </a>
          <Tippy content={presale.project.network} theme={"light"}>
            {NetworkIcon[presale.project.network]}
          </Tippy>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:flex text-sm gap-4 sm:gap-16">
        <div>
          <h3 className="text-gray-400 text-xs">SUPPLY</h3>
          <p className="font-semibold">{presale.supply}</p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">
            {presale.status === PresaleStatus.RUNNING ? "ENDS AT" : "ENDED AT"}
          </h3>
          <p className="font-semibold">
            {presale.status === GiveawayStatus.RUNNING ? (
              <>{presale.endsAt ? timeRemanining : "-"}</>
            ) : (
              <>
                {presale.endsAt
                  ? format(
                      Date.parse(presale.endsAt.toString()),
                      "d MMM yyyy HH:mm"
                    )
                  : "-"}
              </>
            )}
          </p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">SOLD</h3>
          <p className="font-semibold">{presale.entryCount}</p>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs">INTEREST</h3>
          <p className="font-semibold">
            {(presale.entryCount ?? 0) > 0 ? "🔥" : ""}{" "}
            {(presale.entryCount ?? 0) > 100 ? "🔥" : ""}{" "}
            {(presale.entryCount ?? 0) > 200 ? "🔥" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};
