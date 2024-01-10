import { Account, GiveawayEntry, GiveawayRule, User } from "@prisma/client";

export type RuleResult = {
  rule: GiveawayRule;
  error?: string;
  uniqueConstraint?: string;
  multiplier?: number;
};

export type UserResponseType = User & {
  accounts: Account[];
  giveawayEntries?: GiveawayEntry[];
};
