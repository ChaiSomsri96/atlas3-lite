import { GiveawayInput } from "@/frontend/handlers/useHandleCreateGiveaway";

export const OAuthProviders = {
  DISCORD: "discord",
  TWITTER: "twitter",
};

export type OAuthProvider =
  (typeof OAuthProviders)[keyof typeof OAuthProviders];

export const ProjectSocials = {
  TWITTER: "twitter",
  DISCORD: "discord",
};

export type ProjectSocials =
  (typeof ProjectSocials)[keyof typeof ProjectSocials];

export interface FilterOption {
  id: string;
  name: string;
  checked: boolean;
}

export interface SortOption {
  id: string;
  name: string;
}
export type CollabProjectDetails = {
  projectName: string;
  projectDescription: string;
  featuredBanner: string;
  projectSummary: string;
  projectTwitter: string;
  projectDiscord: string;
  projectWebsite: string;
  contactPerson: string;
};

export type CollabMintDetails = {
  blockchainNetwork: string; // TODO: BlockchainNetwork
  supply: number;
  mintPrice: number;
  publicMintDate: string;
  publicMintTime: string;
};

export type CollabGiveawayDetails = {
  selectionMethod: string;
  numberOfWinners: string;
  endDate: string;
  endTime: string;
};

export type RequestCollab = CollabMintDetails &
  CollabProjectDetails &
  CollabGiveawayDetails &
  GiveawayInput;

export const NetworkFilters: FilterOption[] = [
  {
    id: "network_Solana",
    name: "Network: Solana",
    checked: false,
  },
  {
    id: "network_Ethereum",
    name: "Network: Ethereum",
    checked: false,
  },
  {
    id: "network_Polygon",
    name: "Network: Polygon",
    checked: false,
  },
  {
    id: "network_Aptos",
    name: "Network: Aptos",
    checked: false,
  },
  {
    id: "network_Sui",
    name: "Network: Sui",
    checked: false,
  },
  {
    id: "network_Cardano",
    name: "Network: Cardano",
    checked: false,
  },
  {
    id: "network_Bitcoin",
    name: "Network: Bitcoin",
    checked: false,
  },
  {
    id: "network_Avax",
    name: "Network: Avax",
    checked: false,
  },
  {
    id: "network_Venom",
    name: "Network: Venom",
    checked: false,
  },
  {
    id: "network_Injective",
    name: "Network: Injective",
    checked: false,
  },
  {
    id: "network_Sei",
    name: "Network: Sei",
    checked: false,
  },
];

export const GiveawayStatusFilters: FilterOption[] = [
  {
    id: "status_DRAFT",
    name: "Draft",
    checked: false,
  },
  {
    id: "status_RUNNING",
    name: "Running",
    checked: false,
  },
  {
    id: "status_FINALIZED",
    name: "Finalized",
    checked: false,
  },
  {
    id: "status_PENDING_WINNERS",
    name: "Pending",
    checked: false,
  },
  {
    id: "status_COLLAB_PENDING",
    name: "Collab Pending",
    checked: false,
  },
  {
    id: "status_COLLAB_READY",
    name: "Collab Ready",
    checked: false,
  },
  {
    id: "status_COLLAB_REJECTED",
    name: "Collab Rejected",
    checked: false,
  },
];

export const PresaleStatusFilters: FilterOption[] = [
  {
    id: "status_RUNNING",
    name: "Running",
    checked: false,
  },
  {
    id: "status_FINALIZED",
    name: "Finalized",
    checked: false,
  },
];

export const ActivityStatusFilters: FilterOption[] = [
  {
    id: "action_SALE",
    name: "Sale",
    checked: false,
  },
  {
    id: "action_LIST",
    name: "List",
    checked: false,
  },
  {
    id: "action_DELIST",
    name: "Delist",
    checked: false,
  },
  {
    id: "Mine",
    name: "My Activity",
    checked: false,
  },
];
