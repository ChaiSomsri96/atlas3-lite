import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { DiscordRole } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  roles: DiscordRole[];
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.discordGuild) {
    return res
      .status(403)
      .json({ message: "Project does not have a Discord Guild" });
  }

  // Fetch Discord Guild Information for Roles
  const discordGuildRolesRes = await fetch(
    `https://discord.com/api/guilds/${project.discordGuild.id}/roles`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const discordGuildRoles = await discordGuildRolesRes.json();

  const roles = discordGuildRoles.map((role: { id: string; name: string }) => ({
    id: role.id,
    name: role.name,
  }));

  res.status(200).json({ roles });
}
