import { PromisePool } from "@supercharge/promise-pool";

import { checkDiscordRoleRules } from "./discordRoleRules";
import { checkDiscordGuildRules } from "./discordGuildRules";

import { checkFriendshipRules } from "./friendshipRules";
import { checkTweetRules } from "./tweetRules";
import {
  Account,
  Giveaway,
  GiveawayRule,
  GiveawayRuleType,
  Presale,
} from "@prisma/client";
import { RuleResult } from "./types";
import { OAuthProviders } from "@/shared/types";

type RuleResults = {
  results: RuleResult[];
  errorMessage: string | undefined;
  isSuccess: boolean;
  uniqueConstraints?: string;
};

const refreshTokenIfRequired = async (
  accessToken: string,
  userDiscordAccount: Account
) => {
  const userDiscordGuilds = await fetch(
    `https://discord.com/api/users/@me/guilds`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!userDiscordGuilds.ok) {
    // refresh token
    const body = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string,
      client_secret: process.env.DISCORD_CLIENT_SECRET as string,
      grant_type: "refresh_token",
      refresh_token: userDiscordAccount.refresh_token ?? "",
    }).toString();

    const refreshedTokens = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body,
      }
    ).then((res) =>
      res.json().catch((ex) => {
        console.log(ex);
      })
    );

    if (refreshedTokens && refreshedTokens.access_token) {
      await prisma.account.update({
        where: {
          id: userDiscordAccount.id,
        },
        data: {
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token,
        },
      });

      return refreshedTokens.access_token;
    }
  }

  return "";
};

export const checkAllRules = async (
  giveaway: Giveaway,
  accounts: Account[]
): Promise<RuleResults> => {
  // refresh token if relevant
  if (giveaway.rules.length > 0) {
    const isDiscordBased = giveaway.rules.some(
      (rule) =>
        rule.type === GiveawayRuleType.DISCORD_GUILD ||
        rule.type === GiveawayRuleType.DISCORD_ROLE
    );

    if (isDiscordBased) {
      const userDiscordAccount = accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount && userDiscordAccount.access_token) {
        const newAccessToken = await refreshTokenIfRequired(
          userDiscordAccount.access_token,
          userDiscordAccount
        );

        if (newAccessToken && newAccessToken !== "") {
          userDiscordAccount.access_token = newAccessToken;
        }
      }
    }
  }

  const { results, errors } = await PromisePool.for(giveaway.rules).process(
    async (rule) => {
      switch (rule.type) {
        case GiveawayRuleType.DISCORD_GUILD:
          return await checkDiscordGuildRules(accounts, rule);

        case GiveawayRuleType.DISCORD_ROLE:
          return await checkDiscordRoleRules(accounts, rule);

        case GiveawayRuleType.TWITTER_FRIENDSHIP:
          return await checkFriendshipRules(accounts, rule);

        case GiveawayRuleType.TWITTER_TWEET:
          return await checkTweetRules(accounts, rule);

        //case GiveawayRuleType.MINIMUM_BALANCE:
        //return await checkMinimumBalance(accounts, rule);

        // case GiveawayRuleType.OWN_NFT:
        // return await checkOwnNft(accounts, rule);

        default:
          return {
            rule,
            error: `Unknown rule type ${rule.type}`,
          };
      }
    }
  );

  const errorMessage = errors.find((error) => error !== undefined)?.message;
  let uniqueConstraints: string | undefined = results
    .filter((result) => result.uniqueConstraint !== undefined)
    .map((result) => result.uniqueConstraint)
    .join(",");

  if (uniqueConstraints.length === 0) {
    uniqueConstraints = undefined;
  }

  const isSuccess =
    results.every((result) => result.error === undefined) && !errorMessage;

  return { results, errorMessage, isSuccess, uniqueConstraints };
};

export const checkPresaleRules = async (
  presale: Presale,
  accounts: Account[]
): Promise<RuleResults> => {
  // refresh token if relevant
  if (presale.rules.length > 0) {
    const isDiscordBased = presale.rules.some(
      (rule) =>
        rule.type === GiveawayRuleType.DISCORD_GUILD ||
        rule.type === GiveawayRuleType.DISCORD_ROLE
    );

    if (isDiscordBased) {
      const userDiscordAccount = accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount && userDiscordAccount.access_token) {
        const newAccessToken = await refreshTokenIfRequired(
          userDiscordAccount.access_token,
          userDiscordAccount
        );

        if (newAccessToken && newAccessToken !== "") {
          userDiscordAccount.access_token = newAccessToken;
        }
      }
    }
  }

  const { results, errors } = await PromisePool.for(presale.rules).process(
    async (rule) => {
      switch (rule.type) {
        case GiveawayRuleType.DISCORD_GUILD:
          return await checkDiscordGuildRules(accounts, rule);

        case GiveawayRuleType.DISCORD_ROLE:
          return await checkDiscordRoleRules(accounts, rule);

        case GiveawayRuleType.TWITTER_FRIENDSHIP:
          return await checkFriendshipRules(accounts, rule);

        case GiveawayRuleType.TWITTER_TWEET:
          return await checkTweetRules(accounts, rule);

        //  case GiveawayRuleType.MINIMUM_BALANCE:
        //   return await checkMinimumBalance(accounts, rule);

        // case GiveawayRuleType.OWN_NFT:
        //   return await checkOwnNft(accounts, rule);

        default:
          return {
            rule,
            error: `Unknown rule type ${rule.type}`,
          };
      }
    }
  );

  const errorMessage = errors.find((error) => error !== undefined)?.message;
  let uniqueConstraints: string | undefined = results
    .filter((result) => result.uniqueConstraint !== undefined)
    .map((result) => result.uniqueConstraint)
    .join(",");

  if (uniqueConstraints.length === 0) {
    uniqueConstraints = undefined;
  }

  const isSuccess =
    results.every((result) => result.error === undefined) && !errorMessage;

  return { results, errorMessage, isSuccess, uniqueConstraints };
};

export const checkDiscordRoleOnly = async (
  giveaway: Giveaway,
  accounts: Account[]
): Promise<RuleResults> => {
  // refresh token if relevant
  if (giveaway.rules.length > 0) {
    const isDiscordBased = giveaway.rules.some(
      (rule) =>
        rule.type === GiveawayRuleType.DISCORD_GUILD ||
        rule.type === GiveawayRuleType.DISCORD_ROLE
    );

    if (isDiscordBased) {
      const userDiscordAccount = accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount && userDiscordAccount.access_token) {
        const newAccessToken = await refreshTokenIfRequired(
          userDiscordAccount.access_token,
          userDiscordAccount
        );

        if (newAccessToken && newAccessToken !== "") {
          userDiscordAccount.access_token = newAccessToken;
        }
      }
    }
  }

  /*  const results: RuleResult[] = [];

  for (const rule of giveaway.rules) {
    if (rule.type === GiveawayRuleType.DISCORD_ROLE) {
      const roleResult = await checkDiscordRoleRules(user, rule);
      results.push(roleResult);
    }
  }

  const roleResult = await checkDiscordRoleRules(user, ru);*/

  const { results, errors } = await PromisePool.for(giveaway.rules).process(
    async (rule) => {
      switch (rule.type) {
        case GiveawayRuleType.DISCORD_ROLE:
          return await checkDiscordRoleRules(accounts, rule);
        default:
          return {
            rule,
            error: undefined,
          };
      }
    }
  );

  const errorMessage = errors.find((error) => error !== undefined)?.message;

  const isSuccess =
    results.every((result) => result.error === undefined) && !errorMessage;

  return { results, errorMessage, isSuccess };
};

export const checkApplicationRules = async (
  rules: GiveawayRule[],
  accounts: Account[]
): Promise<RuleResults> => {
  // refresh token if relevant
  if (rules.length > 0) {
    const isDiscordBased = rules.some(
      (rule) =>
        rule.type === GiveawayRuleType.DISCORD_GUILD ||
        rule.type === GiveawayRuleType.DISCORD_ROLE
    );

    if (isDiscordBased) {
      const userDiscordAccount = accounts.find(
        (account: Account) => account.provider === OAuthProviders.DISCORD
      );

      if (userDiscordAccount && userDiscordAccount.access_token) {
        const newAccessToken = await refreshTokenIfRequired(
          userDiscordAccount.access_token,
          userDiscordAccount
        );

        if (newAccessToken && newAccessToken !== "") {
          userDiscordAccount.access_token = newAccessToken;
        }
      }
    }
  }

  const { results, errors } = await PromisePool.for(rules).process(
    async (rule) => {
      switch (rule.type) {
        case GiveawayRuleType.DISCORD_GUILD:
          return await checkDiscordGuildRules(accounts, rule);

        case GiveawayRuleType.DISCORD_ROLE:
          return await checkDiscordRoleRules(accounts, rule);

        case GiveawayRuleType.TWITTER_FRIENDSHIP:
          return await checkFriendshipRules(accounts, rule);

        case GiveawayRuleType.TWITTER_TWEET:
          return await checkTweetRules(accounts, rule);

        // case GiveawayRuleType.MINIMUM_BALANCE:
        //  return await checkMinimumBalance(user, rule);

        // case GiveawayRuleType.OWN_NFT:
        //   return await checkOwnNft(user, rule);

        default:
          return {
            rule,
            error: `Unknown rule type ${rule.type}`,
          };
      }
    }
  );

  const errorMessage = errors.find((error) => error !== undefined)?.message;
  let uniqueConstraints: string | undefined = results
    .filter((result) => result.uniqueConstraint !== undefined)
    .map((result) => result.uniqueConstraint)
    .join(",");

  if (uniqueConstraints.length === 0) {
    uniqueConstraints = undefined;
  }

  const isSuccess =
    results.every((result) => result.error === undefined) && !errorMessage;

  return { results, errorMessage, isSuccess, uniqueConstraints };
};
