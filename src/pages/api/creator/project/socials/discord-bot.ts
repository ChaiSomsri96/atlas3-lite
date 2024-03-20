import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { isUserAdmin } from "@/backend/utils";
import { OAuthProviders } from "@/shared/types";

const createHtmlResponse = (textLine1: string, textLine2?: string) => {
  return `<html><body><p>${textLine1}</p><p>${textLine2}</p></body></html>`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, guild_id, permissions, state } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Missing code" });
  }

  if (!guild_id) {
    return res.status(400).json({ message: "Missing guild_id" });
  }

  if (!permissions) {
    return res.status(400).json({ message: "Missing permissions" });
  }

  if (!state) {
    return res.status(400).json({ message: "Missing state" });
  }

  const parsedState = JSON.parse(state as string);

  if (!parsedState.projectId) {
    return res.status(400).json({ message: "Missing projectId" });
  }

  const data = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/creator/project/socials/discord-bot`,
    }),

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = await data.json();

  if (!data.ok) {
    console.log(json);

    return res
      .status(400)
      .send(
        createHtmlResponse(
          `Error: ${json.error_description}`,
          `Please try again.`
        )
      );
  }

  if (json.error) {
    return res
      .status(400)
      .send(
        createHtmlResponse(
          `Error: ${json.error_description}`,
          `Please try again.`
        )
      );
  }

  const { access_token } = json;

  const discordUser = await fetch(`https://discord.com/api/users/@me`, {
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  });

  if (!discordUser.ok) {
    return res.status(400).send(createHtmlResponse(`Error fetching user`));
  }

  const discordUserJson = await discordUser.json();

  const guilds = await fetch(`https://discord.com/api/users/@me/guilds`, {
    headers: {
      authorization: `Bearer ${access_token}`,
    },
  });

  if (!guilds.ok) {
    return res.status(400).send(createHtmlResponse(`Error fetching user`));
  }

  const guildsJson = await guilds.json();

  const guild = guildsJson.find(
    (guild: { id: string }) => guild.id === guild_id
  );

  const project = await prisma.project.findUnique({
    where: {
      id: parsedState.projectId,
    },
  });

  if (!project) {
    return res.status(400).json({
      message: `Project not found.`,
    });
  }

  const userAccount = await prisma.account.findFirst({
    where: {
      providerAccountId: discordUserJson.id,
      provider: OAuthProviders.DISCORD,
    },
  });

  if (!userAccount) {
    return res
      .status(400)
      .send(
        createHtmlResponse(
          `You need to connect your Discord account to your account first.`
        )
      );
  }

  if (!isUserAdmin(project, userAccount.userId)) {
    return res
      .status(400)
      .send(
        createHtmlResponse(
          `You need to be an admin of the project to connect a Discord guild.`
        )
      );
  }

  await prisma.project.update({
    where: {
      id: parsedState.projectId,
    },
    data: {
      discordGuild: {
        id: guild.id,
        name: guild.name,
      },
    },
  });

  res.send(
    createHtmlResponse(
      `Connected to guild ${guild.name}.`,
      "Please close this window and refresh the page to see the changes."
    )
  );
}
