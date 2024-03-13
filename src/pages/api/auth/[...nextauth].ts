import prisma from "@/backend/lib/prisma";
import { PrismaAdapter } from "@/backend/lib/PrismaAdapter";
import { uploadImageToS3 } from "@/backend/utils/uploadToS3";
import { OAuthProviders } from "@/shared/types";
import { User } from "@prisma/client";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: { scope: "identify guilds guilds.members.read" },
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
  ],

  pages: {
    error: "/signin",
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;
      session.user = user as User;
      return session;
    },

    async signIn({ account, profile, user }) {
      if (!account || !profile) return false;

      // unknown provider
      if (!Object.values(OAuthProviders).includes(account.provider)) {
        return false;
      }

      const providerId =
        account.provider === OAuthProviders.DISCORD
          ? profile.id
          : profile.id_str;

      console.log("providerId", providerId);
      // there should be a provider id
      if (!providerId) return false;

      const existingAccount = await prisma.account.count({
        where: {
          provider: account.provider,
          providerAccountId: providerId,
        },
      });

      if (account.provider === OAuthProviders.DISCORD) {
        const username = `${profile.username}#${profile.discriminator}`;
        const image = await uploadImageToS3(profile.image_url);
        if (existingAccount) {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: providerId,
              },
            },
            data: {
              username,
              image,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
            },
          });
        } else {
          // account creation will be handled by the prisma adapter
          account.username = username;
          account.image = image;
        }
      } else if (account.provider === "twitter") {
        const image = await uploadImageToS3(profile.profile_image_url);

        if (existingAccount) {
          await prisma.account.update({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: providerId,
              },
            },
            data: {
              username: profile.screen_name,
              image,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
            },
          });
        } else {
          // account creation will be handled by the prisma adapter
          account.username = profile.screen_name;
          account.image = image;
        }
      }

      // first sign in, we dont have the image saved yet
      if (user.image && !user.image.includes("amazonaws.com")) {
        user.image = await uploadImageToS3(user.image);
      }

      return true;
    },
  },
};

export default NextAuth(authOptions);
