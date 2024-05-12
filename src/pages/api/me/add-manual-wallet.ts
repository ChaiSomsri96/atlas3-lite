import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/backend/lib/prisma";
import { BlockchainNetwork, User } from "@prisma/client";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type ResponseData = {
  user: User;
};

type ErrorData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { address, network } = JSON.parse(req.body);

  if (!address) {
    return res.status(400).json({ message: "Missing address" });
  }

  if (!network) {
    return res.status(400).json({ message: "Missing network" });
  }

  const _network = network as BlockchainNetwork;
  if (
    _network != BlockchainNetwork.Avax &&
    _network != BlockchainNetwork.Venom &&
    _network != BlockchainNetwork.Injective &&
    _network != BlockchainNetwork.Sei
  ) {
    return res.status(400).json({ message: "Invalid blockchain" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const users = await prisma.user.findMany({
    where: {
      wallets: {
        some: {
          address: {
            contains: address,
          },
        },
      },
    },
  });

  if (users?.length > 0) {
    const wallet = users[0].wallets.find((x) => x.address === address);

    if (wallet?.network === network) {
      return res
        .status(404)
        .json({ message: "Wallet already exists on another user." });
    }
  }

  const wallet = user.wallets.find(
    (wallet) => wallet.address === address && wallet.network === network
  );

  if (wallet) {
    return res.status(404).json({ message: "Wallet already exists" });
  }

  const networkWallets = user.wallets.filter(
    (wallet) => wallet.network === network
  );

  const shouldBeDefault =
    networkWallets.find((wallet) => wallet.isDefault) === undefined;

  const modifiedUser = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      wallets: {
        push: {
          address,
          network,
          isDefault: shouldBeDefault,
        },
      },
    },
  });

  res.status(200).json({ user: modifiedUser });
}
