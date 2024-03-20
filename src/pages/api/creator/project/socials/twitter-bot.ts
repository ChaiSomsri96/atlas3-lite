import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { isUserAdmin } from "@/backend/utils";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { code, state } = req.query;

  console.log(req.query);

  if (!code) {
    return res.status(400).json({ message: "Missing code" });
  }

  if (!state) {
    return res.status(400).json({ message: "Missing state" });
  }

  const projectId = state as string;

  if (!projectId) {
    return res.status(400).json({ message: "Missing projectId" });
  }

  const BasicAuthToken = Buffer.from(
    `${process.env.NEXT_PUBLIC_TWITTER_OAUTH2_CLIENT_ID}:${process.env.TWITTER_OAUTH2_CLIENT_SECRET}`,
    "utf8"
  ).toString("base64");
  // get token from twitter oauth2 api
  const data = await fetch(`https://api.twitter.com/2/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      code: code as string,
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_TWITTER_OAUTH2_CLIENT_ID as string,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/creator/project/socials/twitter-bot`,
      code_verifier: "challenge",
    }),

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${BasicAuthToken}`,
    },
  });

  const json = await data.json();

  if (!data.ok) {
    console.log(json);

    return res.status(400).json({ message: "Error in fetching user" });
  }

  const { access_token } = json;

  const twitterUser = await fetch(`https://api.twitter.com/2/users/me`, {
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  });

  if (!twitterUser.ok) {
    return res.status(400).json({ message: "Error in fetching user" });
  }

  const twitterUserJson = await twitterUser.json();

  console.log("twitterUserJson", twitterUserJson);

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    return res.status(400).json({
      message: `Project not found.`,
    });
  }

  if (!isUserAdmin(project, session.user.id)) {
    return res.status(400).json({
      message: `You need to be an admin of the project to connect a twitter.`,
    });
  }

  await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      twitterUsername: twitterUserJson.data.username,
      verified: null,
    },
  });

  res.status(200).json({
    message: `Twitter connected. Refresh the page to see the changes.`,
  });
}
