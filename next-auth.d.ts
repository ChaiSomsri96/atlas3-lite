import { User } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface Profile {
    // for discord
    id?: string;
    id_str?: string;
    username?: string;
    discriminator?: string;
    image_url?: string;

    screen_name?: string;
    profile_image_url?: string;
    // for twitter
    data?: {
      username: string;
      profile_image_url: string;
    };
  }
}
