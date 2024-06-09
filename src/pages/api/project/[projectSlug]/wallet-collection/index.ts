import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { AllowlistEntry, AllowlistType } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  allowlistEntry: AllowlistEntry;
};

type ErrorData = {
  message: string;
};

const submitWallet = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { projectSlug } = req.query;
  const { walletAddress, roleId } = JSON.parse(req.body);

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          entries: {
            where: {
              user: {
                id: session.user.id,
              },
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  if (
    project.allowlist.entries.find((entry) => entry.userId === session.user.id)
  ) {
    return res.status(403).json({ message: "User already has an entry" });
  }

  if (!project.allowlist) {
    return res
      .status(404)
      .json({ message: "Project does not have an allowlist" });
  }

  if (project.allowlist.type !== AllowlistType.DISCORD_ROLE) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (project.allowlist.closesAt && new Date() > project.allowlist.closesAt) {
    return res.status(403).json({ message: "Wallet submissions are closed" });
  }

  if (!project.allowlist.roles.some((role) => role.id === roleId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (
    project.allowlist.maxCap &&
    project.allowlist.maxCap <= project.allowlist._count.entries
  ) {
    return res.status(403).json({ message: "Allowlist is full" });
  }

  //   Check if the user has a role in the given discord server
  const discordRes = await fetch(
    `https://discord.com/api/guilds/${process.env.DISCORD_SERVER_ID}/members/${session.user.id}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!discordRes.ok) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const discordUser = await discordRes.json();

  const hasRole = discordUser.roles.includes(roleId);

  if (!hasRole) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // TODO: remove this once we have a better way to check if a user is in a role
  const allowlistEntry = await prisma.allowlistEntry.create({
    data: {
      walletAddress: walletAddress as string,
      user: {
        connect: {
          id: session.user.id,
        },
      },
      source: "wallet-collection",
      role: {
        multiplier: 1,
        name: "Creator",
        id: "creator",
      },
      allowlist: {
        connect: {
          id: project.allowlist.id,
        },
      },
    },
  });

  res.status(200).json({ allowlistEntry });
};

const deleteWallet = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) => {
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
      allowlist: {
        include: {
          entries: {
            where: {
              user: {
                id: session.user.id,
              },
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  if (!project.allowlist.entries.length) {
    return res.status(403).json({ message: "User does not have an entry" });
  }

  const allowlistEntry = await prisma.allowlistEntry.delete({
    where: {
      id: project.allowlist.entries[0].id,
    },
  });

  res.status(200).json({ allowlistEntry });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "PUT":
      return await submitWallet(req, res);
    case "DELETE":
      return await deleteWallet(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
