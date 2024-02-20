import {
  BlockchainNetwork,
  CollabType,
  Giveaway,
  GiveawayRule,
  GiveawaySettings,
  GiveawayType,
} from "@prisma/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { GIVEAWAY_KEY } from "../hooks/useGiveaway";

export type GiveawayInput = {
  id?: string;
  name?: string;
  description: string;
  projectSlug: string;
  projectId?: string;
  endsAt: Date | string;
  type: GiveawayType;
  maxWinners: number;
  rules: Partial<GiveawayRule>[];
  discordPost: boolean;
  collabProjectId?: string;
  collabProjectIds: string[];
  collabRequestDeadline?: Date;
  collabDuration?: number;
  collabType: CollabType;
  giveawayRoleId: string;
  settings: GiveawaySettings;
  network?: BlockchainNetwork;
  bannerUrl?: string;
  isPaymentEnabled: boolean;
  paymentTokenId?: string;
  paymentTokenAmount?: number;
  teamSpots?: number;
};

export const useHandleCreateGiveaway = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  let toastingId = "";
  return useMutation(
    async ({
      id,
      name,
      description,
      projectSlug,
      endsAt,
      projectId,
      type,
      rules,
      maxWinners,
      discordPost,
      collabProjectId,
      collabProjectIds,
      collabRequestDeadline,
      collabDuration,
      collabType,
      giveawayRoleId,
      settings,
      network,
      bannerUrl,
      paymentTokenId,
      paymentTokenAmount,
      teamSpots,
    }: GiveawayInput): Promise<Giveaway> => {
      toastingId = toast.loading(`${id ? "Updating" : "Creating"} giveaway...`);
      const request = await fetch(
        `/api/creator/project/${projectSlug}/giveaway/create-update`,
        {
          method: id ? "POST" : "PUT",
          body: JSON.stringify({
            id,
            name,
            description,
            endsAt,
            type,
            rules,
            projectId,
            maxWinners,
            discordPost,
            collabProjectId,
            collabProjectIds,
            collabRequestDeadline,
            collabDuration,
            collabType,
            giveawayRoleId,
            settings,
            network,
            bannerUrl,
            paymentTokenId: paymentTokenId ? paymentTokenId : null,
            paymentTokenAmount: paymentTokenAmount ? paymentTokenAmount : null,
            teamSpots,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const giveaway: Giveaway = data.giveaway;
      return giveaway;
    },
    {
      onSuccess: async (data, variables) => {
        toast.success(`${variables.id ? "Updated" : "Created"} giveaway.`, {
          id: toastingId,
        });
        await queryClient.invalidateQueries(GIVEAWAY_KEY);
        if (router.asPath.includes("/creator/")) {
          router.push(`/creator/project/${variables.projectSlug}/giveaways`);
        } else {
          toast.success("Collab request submitted successfully.");
        }
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });

        console.log("Create Givaway Failed", e);
      },
    }
  );
};
