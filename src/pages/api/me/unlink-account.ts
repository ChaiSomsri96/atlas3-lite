import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { Account } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  deletedAccount: Account;
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

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { provider } = JSON.parse(req.body);

  if (!provider) {
    return res.status(400).json({ message: "Missing provider" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.accounts.length === 1) {
    return res.status(400).json({ message: "Cannot unlink last account" });
  }

  const account = user.accounts.find(
    (account) => account.provider === provider
  );

  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }

  // dont allow if account has active buy records
  const activeBuyRecords = await prisma.marketplaceRecord.findMany({
    where: {
      createdByUserId: user.id,
      processed: false,
      listed: true,
    },
  });

  if (activeBuyRecords.length > 0) {
    return res.status(400).json({
      message: "Cannot unlink account with active allowlist listings. If you need to relink, use the relink button.",
    });
  }

  const allowlistEntries = await prisma.allowlistEntry.findMany({
    where: {
      userId: user.id
    }
  })

  if (allowlistEntries.length > 0 && provider === "discord")
  {
    return res.status(400).json({
      message: "Cannot disconnect with linked allowlist entries. If you need to relink, use the relink button.",
    });
  }

  const presaleEntries = await prisma.presaleEntry.findMany({
    where: {
      userId: user.id
    }
  })

  if (presaleEntries.length > 0 && provider === "discord")
  {
    return res.status(400).json({
      message: "Cannot disconnect with linked presale entries. If you need to relink, use the relink button.",
    });
  }

  const deletedAccount = await prisma.account.delete({
    where: {
      id: account.id,
    },
  });

  res.status(200).json({ deletedAccount });
}
