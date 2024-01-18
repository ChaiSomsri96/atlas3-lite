import { OAuthProvider, OAuthProviders } from "@/shared/types";
import tw from "twin.macro";
import styled from "styled-components";

export const Button = tw.button`flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition duration-150 ease-in-out`;

export const PrimaryButton = tw(Button)`bg-primary-500 hover:bg-primary-600`;

export const OutlineButton = tw(
  Button
)`border border-primary-500 text-primary-500 hover:bg-dark-600 `;

export const LinkAccountCard = styled.div(
  ({ provider }: { provider: OAuthProvider }) => [
    provider === OAuthProviders.DISCORD
      ? tw`bg-discord border-discord`
      : provider === OAuthProviders.TWITTER
      ? tw`bg-twitter border-twitter`
      : "",
    tw`flex justify-between px-3 py-4 w-full rounded-lg bg-opacity-10 border border-dashed`,
  ]
);
