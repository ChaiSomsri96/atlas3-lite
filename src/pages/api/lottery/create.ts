import type { NextApiRequest, NextApiResponse } from "next";
import { BlockchainNetwork, Reward } from "@prisma/client";

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
  const jackpotPrizes: Reward[] = [
    {
      name: "Smyth",
      imageUrl: "https://metadata.smyths.io/1242.png",
      quantity: 1,
      sponsored: "Blocksmith Labs",
    },
    {
      name: "Meegos",
      imageUrl: "https://assets.meegos.io/resized-new/636cace94f63c418.png",
      quantity: 1,
      sponsored: "Blocksmith Labs",
    },
  ];

  const lotteryPrizes: Reward[] = [
    {
      name: "Bozo Collective NFT",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723483149275136/W_J4MHEz_400x400.png",
      quantity: 1,
      sponsored: "Blocksmith Labs",
    },
    {
      name: "Gambulls Voucher",
      imageUrl:
        "https://media.discordapp.net/attachments/1045293041000398868/1158718493831741501/telegram-cloud-photo-size-4-5828063882877452180-y.jpg",
      quantity: 1,
      sponsored: "Gambulls",
    },
    {
      name: "Goofs OG WL",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723573586862102/ykz6wbz8_400x400.png",
      quantity: 1,
      sponsored: "Goofs",
    },
    {
      name: "Stupidos OG WL",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723669942607943/Zs7DGoC1_400x400.png",
      quantity: 2,
      sponsored: "Stupidos",
    },
    {
      name: "Wabaland WL",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723780873556099/oE6sihdP_400x400.png",
      quantity: 3,
      sponsored: "Wabaland",
    },
    {
      name: "King Royal WL Spots",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723421421711380/WFkpCYG4_400x400.png",
      quantity: 20,
      sponsored: "King Royal",
    },
    {
      name: "Keepers WL",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723350105956363/2l-x25Gf_400x400.png",
      quantity: 1,
      sponsored: "The Keepers",
    },
    {
      name: "50 USD in $KING",
      imageUrl:
        "https://media.discordapp.net/attachments/1084863619717673020/1158723284750315611/image.png",
      quantity: 1,
      sponsored: "King Royal",
    },
  ];

  await prisma.lottery.create({
    data: {
      status: "RUNNING",
      endsAt: new Date(Date.now() + 48 * (60 * 60 * 1000)),
      maxWinners:
        lotteryPrizes.map((x) => x.quantity).reduce((a, b) => a + b, 0) + 5,
      usdReward: 200,
      jackpotPrizes,
      lotteryPrizes,
      network: BlockchainNetwork.Solana,
    },
  });

  res.status(200).json({ success: true });
}
