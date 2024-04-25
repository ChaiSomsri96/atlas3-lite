import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { PROJECT_KEY } from "./useProject";

export const useProjectManagers = ({ slug }: { slug: string }) => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<User[] | undefined>(
    [PROJECT_KEY, "projectManagers", session?.user?.id, slug],
    async () => {
      const response = await fetch(`/api/creator/project/${slug}/team`);

      if (!response.ok) {
        throw new Error("Failed to fetch project managers");
      }

      const data = await response.json();
      const users: User[] = data.users;

      return users;
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
