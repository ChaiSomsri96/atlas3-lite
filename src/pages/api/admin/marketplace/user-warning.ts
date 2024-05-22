import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";

type ResponseData = {
  success: boolean;
};

type ErrorData = {
  message: string;
};

async function createWarningsIfNeeded(): Promise<void> {
  const groupedRecords = await prisma.marketplaceRecord.groupBy({
    by: ["createdByUserId", "projectId"],
    where: {
      listed: false,
      processed: true,
    },
    _count: true,
  });

  const filteredRecords = groupedRecords.filter(
    (record) => record._count && record._count > 5
  );

  const ignoreUserIds = [
    "63fb1d95fd5e52f346500675",
    "644836965161d9f695844758",
    "644a668aa52b06b2848c60af",
    "63fafdb118dc0658684d1319",
    "641ee4895f494ee41a1f78a7",
    "63f5f3c8b8e021c0d0805019",
    "641c35b24107499ed85a31ff",
    "63fc891bd476b193a3d79e0d",
    "6440313275d5f41f854f12ea",
    "644a01b8f8e32a70b86a1590",
    "641d39fa9003d91667dbcd9f",
    "6419af59cd4b39de8719c585",
    "644bd67b6b233043c0bb9475",
    "644cbd9ab33a05c9498f6654",
    "644a7bb4f8e32a70b86a233d",
  ];

  for (const record of filteredRecords) {
    const userId = record.createdByUserId;
    const projectId = record.projectId;

    if (ignoreUserIds.includes(userId)) {
      continue;
    }

    const existingWarning = await prisma.marketplaceUserWarning.findFirst({
      where: {
        userId: userId,
        projectId: projectId,
      },
    });

    if (existingWarning) {
      await prisma.marketplaceUserWarning.update({
        where: {
          id: existingWarning.id,
        },
        data: {
          count: record._count,
        },
      });
    } else {
      await prisma.marketplaceUserWarning.create({
        data: {
          userId: userId,
          projectId: projectId,
          count: record._count,
        },
      });
      console.log(
        `MarketplaceUserWarning record created for userId: ${userId} and projectId: ${projectId}`
      );
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  await createWarningsIfNeeded();

  return res.status(200).json({ success: true });
}
