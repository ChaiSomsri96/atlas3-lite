import type { NextApiRequest, NextApiResponse } from "next";
import { twitterClientForUser } from "@/backend/lib/twitter";

import prisma from "@/backend/lib/prisma";
import { ApplicationStatus, MeeListApplications } from "@prisma/client";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  application: MeeListApplications;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const application = await prisma.meeListApplications.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  // get twitter user id

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      provider: "twitter",
    },
  });

  let twitterUsername = "";
  let twitterImageUrl = "";
  let followers = 0;

  if (application && accounts.length > 0) {
    try {
      const client = twitterClientForUser(accounts[0]);

      const user = await client.currentUser();

      if (user) {
        twitterUsername = user.screen_name;
        twitterImageUrl = user.profile_image_url_https.replace(
          "normal",
          "400x400"
        );
        followers = user.followers_count;
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message:
          "Error creating application, please raise a ticket on BSL discord",
      });
    }

    const modifiedUser = await prisma.meeListApplications.update({
      where: {
        userId: session.user.id,
      },
      data: {
        status: ApplicationStatus.PENDING,
        twitterUserId: accounts[0].providerAccountId,
        twitterUsername: twitterUsername,
        twitterImageUrl: twitterImageUrl,
        followers: followers,
      },
    });

    return res.status(200).json({ application: modifiedUser });
  }
}
