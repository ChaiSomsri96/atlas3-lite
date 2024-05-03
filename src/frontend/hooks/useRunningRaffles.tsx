import { ExtendedProject } from "@/pages/api/creator/owned-projects";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";
import { Giveaway, PaymentToken } from "@prisma/client";
import { ExtendedGiveawayEntry } from "./useGiveawayEntries";

export type ExtendedRaffle = {
  collabProject: ExtendedProject;
  entries: ExtendedGiveawayEntry[];
  paymentToken?: PaymentToken;
  entriesCount: number;
} & Giveaway;

export type RunningRafflesResp = {
  raffles: ExtendedRaffle[];
  total: number;
};

export const useRunningRaffles = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<RunningRafflesResp>(
    [PROJECT_KEY, "liveRaffles", session?.user?.id],
    async () => {
      const response = await fetch(`/api/raffles/running`);

      if (!response.ok) {
        throw new Error("Failed to fetch running raffles");
      }

      const data = await response.json();

      return {
        raffles: data.raffles,
        total: data.total,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
