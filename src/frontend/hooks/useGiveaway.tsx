import {
  Account,
  Giveaway,
  GiveawayEntry,
  GiveawayWithdraw,
  PaymentToken,
  Project,
  User,
} from "@prisma/client";
import { useQuery } from "react-query";

export const GIVEAWAY_KEY = "giveaway";

type ExtendedGiveawayEntry = {
  user: {
    accounts: Account;
  };
} & GiveawayEntry;

export type ExtendedGiveaway = {
  project: Project;
  entries: ExtendedGiveawayEntry[];
  collabProject?: Project;
  owner: User;
  paymentToken?: PaymentToken;
  withdraw?: GiveawayWithdraw;
} & Giveaway;

export const getGiveaway = async (
  projectSlug: string,
  giveawaySlug: string
) => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/project/${projectSlug}/giveaway/${giveawaySlug}`
    : `/api/project/${projectSlug}/giveaway/${giveawaySlug}`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const giveaway: ExtendedGiveaway = data.giveaway;

  return giveaway;
};

export const useGiveaway = ({
  giveawaySlug,
  projectSlug,
}: {
  projectSlug: string;
  giveawaySlug: string;
}) => {
  return useQuery<ExtendedGiveaway>(
    [GIVEAWAY_KEY, "giveaway", projectSlug, giveawaySlug],
    () => getGiveaway(projectSlug, giveawaySlug)
  );
};
