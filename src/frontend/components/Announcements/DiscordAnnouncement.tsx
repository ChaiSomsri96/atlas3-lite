import { HiSpeakerphone } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { isUserManager } from "@/backend/utils";
import { Project } from "@prisma/client";

export const DiscordAnnouncement = ({
  selectedProject,
}: {
  selectedProject: Project;
}) => {
  const { data: session } = useSession();

  const handleAddDiscordBot = () => {
    const encodedRedirectUri = encodeURIComponent(
      `${window.location.origin}/api/creator/project/socials/discord-bot`
    );

    const state = JSON.stringify({
      projectId: selectedProject?.id,
    });

    window.open(
      `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=34628660305&scope=bot&redirect_uri=${encodedRedirectUri}&state=${state}`,
      "_blank",
      "location=yes,height=570,width=520,scrollbars=yes,status=yes"
    );
  };

  return (
    <div className="w-full inset-x-0 pb-2 sm:pb-5 mt-5 ">
      <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-r bg-gray-800 p-2 shadow-lg sm:p-3">
          <div className="hidden md:flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-gray-800 p-2">
                <HiSpeakerphone
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </span>
              <div className="ml-3 font-medium text-white">
                <span className="hidden md:inline">
                  Add the Atlas3 Discord Bot to your server.
                </span>
                <div className="text-neutral-100 text-xs">
                  In order to publish your project, you will need to add the
                  Atlas3 Discord Bot to your server.
                </div>
              </div>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <button
                onClick={handleAddDiscordBot}
                disabled={isUserManager(
                  selectedProject,
                  session?.user?.id ?? ""
                )}
                className="flex items-center cursor-pointer justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm"
              >
                Add Discord Bot
              </button>
            </div>
          </div>
          {/*mobile*/}
          <div className="flex flex-wrap items-center justify-between md:hidden">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-gray-800 p-2">
                <HiSpeakerphone
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </span>
              <div className="ml-3 font-medium text-white">
                <span className="">
                  Add the Atlas3 Discord Bot to your server.
                </span>
                <div className="text-neutral-100 text-xs">
                  You need to add the Atlas3 Discord Bot to your server.
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddDiscordBot}
            disabled={isUserManager(selectedProject, session?.user?.id ?? "")}
            className="flex mt-5 items-center cursor-pointer justify-center md:hidden rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-50"
          >
            Quick Publish
          </button>
        </div>
      </div>
    </div>
  );
};
