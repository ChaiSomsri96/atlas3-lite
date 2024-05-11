import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

import { AllowlistEntry } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { isUserAdmin, isUserManager } from "@/backend/utils";

type ResponseData = {
  entry: AllowlistEntry;
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
  const { userId } = JSON.parse(req.body);

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug as string,
    },
    include: {
      allowlist: {
        include: {
          entries: true,
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (
    !isUserAdmin(project, session.user.id) &&
    !isUserManager(project, session.user.id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!project.allowlist) {
    return res
      .status(403)
      .json({ message: "Project does not have an allowlist" });
  }

  if (project.allowlist.entries.find((entry) => entry.userId === userId)) {
    return res.status(403).json({ message: "User already has an entry" });
  }

  if (!project.allowlist) {
    return res
      .status(404)
      .json({ message: "Project does not have an allowlist" });
  }

  const userWallets = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!userWallets) {
    return res
      .status(404)
      .json({ message: "User does not have any wallets connected." });
  }

  const defaultWallet = userWallets.wallets.find(
    (wallet) => wallet.network === project.network
  );

  if (!defaultWallet) {
    return res.status(404).json({
      message: `User does not have a wallet connected for your projects network (${project.network}`,
    });
  }

  const discordRole = {
    id: "ranking",
    name: "Ranking Allowlist Entry",
    multiplier: 1,
  };

  const entry = await prisma.allowlistEntry.create({
    data: {
      walletAddress: defaultWallet.address,
      role: discordRole,
      source: "rankings",
      allowlist: {
        connect: {
          id: project.allowlist?.id,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return res.status(200).json({ entry });
}
