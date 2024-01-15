import {
  EthosWallet,
  SuietWallet,
  SuiWallet,
  WalletProvider,
} from "@suiet/wallet-kit";
import { ReactNode } from "react";

import "@suiet/wallet-kit/style.css";

export const SuiWalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WalletProvider
      autoConnect={false}
      defaultWallets={[SuiWallet, SuietWallet, EthosWallet]}
    >
      {children}
    </WalletProvider>
  );
};
