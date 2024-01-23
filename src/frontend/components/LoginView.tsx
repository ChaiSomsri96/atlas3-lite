import { OAuthProviders } from "@/shared/types";
import { signIn } from "next-auth/react";
import { SiDiscord } from "react-icons/si";
import PublicLayout from "./Layout/PublicLayout";
import tw from "twin.macro";
import { Button } from "@/styles/BaseComponents";

export const DiscordButton = tw(Button)`bg-discord w-48`;

export const LoginView = () => {
  return (
    <PublicLayout>
      <div className="flex flex-col justify-center items-center space-y-4">
        <h2 className="text-2xl font-semibold mb-12">No account detected</h2>
        <p className="text-center">
          In order to see your projects, please connect your Discord.
        </p>
        <div className="flex flex-col sm:flex-row  gap-2  mb-6">
          <DiscordButton
            onClick={() => {
              signIn(OAuthProviders.DISCORD);
            }}
          >
            <SiDiscord className="h-5 w-5" />
            <p className="font-medium">Login with Discord</p>
          </DiscordButton>
          {/*<TwitterButton
            onClick={() => {
              signIn(OAuthProviders.TWITTER);
            }}
          >
            <SiTwitter className="h-5 w-5" />
            <p className="font-medium">Login with Twitter</p>
          </TwitterButton>*/}
        </div>

        <img
          src="/assets/empty-state.svg"
          alt="Empty State"
          className="w-1/2 pt-6"
        />
      </div>
    </PublicLayout>
  );
};
