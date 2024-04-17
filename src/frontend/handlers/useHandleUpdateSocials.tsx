import { GiveawayRule, Project, ChannelPostSettings } from "@prisma/client";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export const SOCIALS_KEY = "user";

export type UpdateSocialsInput = {
  projectSlug: string;
  defaultRoleId: string;
  rules: Partial<GiveawayRule>[];
  holderRules: Partial<GiveawayRule>[];
  incomingCollabsChannelId: string;
  incomingCollabsTagId: string;
  channelPostSettings: ChannelPostSettings[];
  withdrawSOLAddress: string;
  winnerChannelId: string;
};

export const useHandleUpdateSocials = () => {
  const queryClient = useQueryClient();
  let toastId = "";
  return useMutation(
    async ({
      projectSlug,
      defaultRoleId,
      rules,
      holderRules,
      incomingCollabsChannelId,
      incomingCollabsTagId,
      channelPostSettings,
      withdrawSOLAddress,
      winnerChannelId,
    }: UpdateSocialsInput): Promise<Project> => {
      toastId = toast.loading("Updating socials...");
      const request = await fetch(
        `/api/creator/project/${projectSlug}/socials/update-socials`,
        {
          method: "PUT",
          body: JSON.stringify({
            defaultRoleId,
            rules,
            holderRules,
            incomingCollabsChannelId,
            incomingCollabsTagId,
            channelPostSettings,
            withdrawSOLAddress,
            winnerChannelId,
          }),
        }
      );

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const project: Project = data.giveaway;
      return project;
    },
    {
      onSuccess: async () => {
        console.log("Respond Socials Succeded");
        await queryClient.invalidateQueries(SOCIALS_KEY);
        toast.success("Socials updated.", { id: toastId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastId });

        console.log("Respond Socials Failed", e);
      },
    }
  );
};
