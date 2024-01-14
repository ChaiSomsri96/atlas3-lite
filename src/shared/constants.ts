import { PublicKey } from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);
export const VAULT_PUBLIC_KEY = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY
);
export const POINTS_VAULT_PUBLIC_KEY = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY_POINTS
);

export const VAULT_PUBLIC_KEY_FORGE_STAKED = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PUBLIC_KEY_FORGE_STAKED
);

export const FORGE_MINT = new PublicKey(process.env.NEXT_PUBLIC_FORGE_MINT);
export const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
