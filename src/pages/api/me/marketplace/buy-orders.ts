import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import {
  AllowlistEntry,
  MarketplaceRecord,
  Project,
  TradeType,
  User,
} from "@prisma/client";

type MarketplaceRecordData = {
  createdBy: User;
  project: Project;
  entry: AllowlistEntry | null;
} & MarketplaceRecord;

type ResponseData = {
  records: MarketplaceRecordData[];
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

  const records = await prisma.marketplaceRecord.findMany({
    where: {
      processed: false,
      tradeType: TradeType.BUY,
      listed: true,
    },
    include: {
      project: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const projectIds = records.map((record) => record.projectId);

  // get users allowlist entries for these projectIds
  const filteredAllowlists = await prisma.allowlist.findMany({
    where: {
      projectId: {
        in: projectIds,
      },
      entries: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      entries: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  // add allowlist entries to records
  let recordsWithAllowlist = records.map((record) => {
    const allowlist = filteredAllowlists.find(
      (allowlist) => allowlist.projectId === record.projectId
    );

    let entry = allowlist?.entries[0];

    if (record.role) {
      entry = allowlist?.entries.find(
        (entry) => entry.role?.id === record.role?.id
      );
    }
    return {
      ...record,
      entry: entry ?? null,
    };
  });

  // order recordsWithAllowlist so that records with entry are first
  recordsWithAllowlist = recordsWithAllowlist.sort((a, b) => {
    if (a.entry && !b.entry) {
      return -1;
    } else if (!a.entry && b.entry) {
      return 1;
    } else {
      return 0;
    }
  });

  res.status(200).json({ records: recordsWithAllowlist });
}
