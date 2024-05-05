import { Account, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";

type UserDetails = {
  accounts: Account[];
} & User;

export const USER_KEY = "user";

export const useUserDetails = () => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<UserDetails | undefined>(
    [USER_KEY, "userDetails", session?.user?.id],
    async () => {
      const response = await fetch("/api/me");

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      const userDetails: UserDetails = data.user;

      return userDetails;
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
