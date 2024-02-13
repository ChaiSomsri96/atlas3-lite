import { BlockchainNetwork, Project, ProjectPhase } from "@prisma/client";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_KEY } from "../hooks/useProject";

export type ProjectInput = {
  id?: string;
  name: string;
  description: string;
  network: BlockchainNetwork;
  phase: ProjectPhase;
  supply: number | null | undefined;
  mintPrice: number | null | undefined;
  mintDate: string | null | undefined;
  mintTime: string | null | undefined;
  imageUrl: string | null | undefined;
  bannerUrl: string | null | undefined;
  websiteUrl: string | null | undefined;
  discordInviteUrl: string | null | undefined;
  referrer: string | null | undefined;
};

export const useHandleCreateOrUpdateProject = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  let toastingId = "";

  return useMutation(
    async ({
      id,
      name,
      description,
      network,
      phase,
      supply,
      mintPrice,
      mintDate,
      mintTime,
      imageUrl,
      bannerUrl,
      websiteUrl,
      discordInviteUrl,
      referrer,
    }: ProjectInput): Promise<Project> => {
      toastingId = toast.loading("Saving project...");

      const request = await fetch("/api/creator/project", {
        method: id ? "POST" : "PUT",
        body: JSON.stringify({
          id,
          name,
          description,
          network,
          phase,
          supply,
          mintPrice,
          mintDate,
          mintTime,
          imageUrl,
          bannerUrl,
          websiteUrl,
          discordInviteUrl,
          referrer,
        }),
      });

      const data = await request.json();
      if (!request.ok) {
        throw new Error(data.message);
      }

      const project: Project = data.project;
      return project;
    },
    {
      onSuccess: async (data, input) => {
        console.log("Create/Update Project Succeded");

        await queryClient.invalidateQueries(PROJECT_KEY);

        if (!input.id && data.slug) {
          router.push(`/creator/project/${data.slug}/socials`);
        }

        toast.success("Project saved.", { id: toastingId });
      },
      onError: (e: Error) => {
        toast.error(e.message, { id: toastingId });

        console.log("Create Project Failed", e);
      },
    }
  );
};
