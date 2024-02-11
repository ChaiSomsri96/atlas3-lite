import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/backend/lib/prisma";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  // get all giveaways that are running
  const giveaways = await prisma.giveaway.findMany({
    where: {
      status: "RUNNING",
      type: "RAFFLE",
      entryCount: {
        gt: 1,
      },
    },
  });

  if (!giveaways) {
    return res.status(404).json({ message: "No giveaways found" });
  }

  const userQueue = await prisma.discordUserRoleQueue.findMany();

  if (!userQueue || userQueue.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  for (const giveaway of giveaways) {
    const rules = giveaway.rules
      .filter((x) => x.type === "DISCORD_ROLE")
      .map((x) => x.discordRoleRule);

    if (rules.length === 0) continue;

    for (const rule of rules) {
      if (rule) {
        for (const role of rule.roles) {
          const roleQueue = userQueue.filter(
            (x) => x.discordRoleId === role.role.id
          );

          if (roleQueue.length > 0) {
            for (const user of roleQueue) {
              console.log(
                `Deleted giveaway entry for ${user.discordUserId} as he no longer has role for ${giveaway.id}`
              );

              await prisma.giveawayEntry.deleteMany({
                where: {
                  discordUserId: user.discordUserId,
                  giveawayId: giveaway.id,
                },
              });
            }
          }
        }
      }
    }
  }

  // delete allowlist entry related to this user and role id
  for (const user of userQueue) {
    const account = await prisma.account.findFirst({
      where: {
        providerAccountId: user.discordUserId,
      },
    });

    if (account) {
      const allowlistEntries = await prisma.allowlistEntry.findMany({
        where: {
          userId: account.userId,
        },
      });

      if (allowlistEntries.length > 0) {
        for (const entry of allowlistEntries) {
          if (entry.role?.id === user.discordRoleId) {
            console.log(
              `Deleted allowlist entry for ${user.discordUserId} as he no longer has role for ${entry.id}`
            );

            await prisma.allowlistEntry.delete({
              where: {
                id: entry.id,
              },
            });
          }
        }
      }
    }
  }

  // delete from user queue where ids in
  await prisma.discordUserRoleQueue.deleteMany({
    where: {
      id: {
        in: userQueue.map((x) => x.id),
      },
    },
  });

  res.status(200).json({ success: true });
}
