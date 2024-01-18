import { HiSpeakerphone } from "react-icons/hi";
import { useSession } from "next-auth/react";
import { isUserManager } from "@/backend/utils";
import { Project } from "@prisma/client";

export const TwitterAnnouncement = ({
  selectedProject,
}: {
  selectedProject: Project;
}) => {
  const { data: session } = useSession();

  const handleConnectTwitter = async () => {
    const encodedRedirectUri = `${window.location.origin}/api/creator/project/socials/twitter-bot`;

    const state = selectedProject?.id;

    window.open(
      `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_TWITTER_OAUTH2_CLIENT_ID}&redirect_uri=${encodedRedirectUri}&state=${state}&scope=tweet.read%20users.read%20follows.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`,
      "_blank",
      "height=570,width=520"
    );
  };

  return (
    <div className="max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-gradient-to-r bg-gray-800 p-2 sm:p-3">
        <div className="hidden md:flex flex-wrap items-center justify-between">
          <div className="flex w-0 flex-1 items-center">
            <span className="flex rounded-lg bg-gray-800 p-2">
              <HiSpeakerphone
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </span>
            <div className="ml-3 font-medium text-white">
              <span className="hidden md:inline text-lg">
                Link your Twitter
              </span>
              <div className="text-neutral-100 text-sm pr-5">
                In order to get verified on Atlas3, you will need to link your
                Twitter account. Verified means you will receive a blue check
                mark next to your avatar which gives an indication to other
                projects that you are genuine.
              </div>
            </div>
          </div>
          <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
            <button
              onClick={handleConnectTwitter}
              disabled={isUserManager(selectedProject, session?.user?.id ?? "")}
              className="flex items-center cursor-pointer justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              Link Twitter
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
            <div className="ml-3 font-medium text-white text-lg">
              <span className="">Link your Twitter</span>
              <div className="text-neutral-100 text-md">
                In order to get the verified checkmark on Atlas3, you will need
                to link your Twitter account.
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleConnectTwitter}
          disabled={isUserManager(selectedProject, session?.user?.id ?? "")}
          className="flex mt-5 items-center cursor-pointer justify-center md:hidden rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-50"
        >
          Quick Publish
        </button>
      </div>
    </div>
  );
};
