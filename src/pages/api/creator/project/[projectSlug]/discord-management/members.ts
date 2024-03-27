import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { isUserAdmin, isUserManager } from "@/backend/utils";

export type GuildMembersResponseData = {
  members: MemberData[];
};

export type MemberData = {
  roles: [string];
  user: { id: string; username: string; discriminator: string };
};

type ErrorData = {
  message: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getGuildMembers = async (guildId: string, after: string) => {
  // Fetch Discord Guild Information for Roles
  const discordGuildMembersRes = await fetch(
    `https://discord.com/api/guilds/${guildId}/members?limit=1000&after=${after}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  return await discordGuildMembersRes.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GuildMembersResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug, after } = req.query;

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

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  let discordGuildMembers = await getGuildMembers(
    project.discordGuild.id,
    after as string
  );

  while (
    discordGuildMembers &&
    discordGuildMembers.message &&
    discordGuildMembers.retry_after
  ) {
    await sleep(discordGuildMembers.retry_after);
    discordGuildMembers = await getGuildMembers(
      project.discordGuild.id,
      after as string
    );
  }

  const members = discordGuildMembers.map((member: MemberData) => ({
    user: {
      id: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
    },
    roles: member.roles,
  }));

  res.status(200).json({ members });
}
