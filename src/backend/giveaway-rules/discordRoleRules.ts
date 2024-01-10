import { RuleResult } from "./types";
import {
  Account,
  DiscordRoleRule,
  DiscordRoleRuleType,
  GiveawayRule,
} from "@prisma/client";
import { OAuthProviders } from "@/shared/types";

const botGetDiscordMemberDetails = async (
  userId: string,
  discordRoleRule: DiscordRoleRule,
  rule: GiveawayRule
): Promise<RuleResult> => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${discordRoleRule.guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    const resJson = await response.json();

    if (resJson && resJson.message && resJson.message === "Unknown Guild") {
      return {
        rule,
        error: `Bot not in guild`,
      };
    }

    if (resJson.message && resJson.message === "You are being rate limited.") {
      console.log("rate limited on role checks", resJson);

      return {
        rule,
        error: `Rate limited`,
      };
    }

    if (Object.keys(resJson).includes("code")) {
      if (resJson.message && resJson.message === "Unknown Guild") {
        return {
          rule,
          error: `Bot not in guild`,
        };
      }
      return {
        rule,
        error: `Bot not in guild`,
      };
    }

    if (resJson && resJson.user && resJson.roles) {
      let highestMultiplier: null | number = null;
      discordRoleRule.roles.forEach((role) => {
        if (
          (resJson.roles.includes(role.role.id) &&
            role.type === DiscordRoleRuleType.HAVE_ROLE) ||
          (!resJson.roles.includes(role.role.id) &&
            role.type === DiscordRoleRuleType.DONT_HAVE_ROLE)
        ) {
          if (highestMultiplier === null) {
            highestMultiplier = role.role.multiplier;
          } else if (role.role.multiplier > highestMultiplier) {
            highestMultiplier = role.role.multiplier;
          }
        }
      });

      if (highestMultiplier === null) {
        return {
          rule,
          error: `You do not have any of the roles required to enter this giveaway`,
        };
      }

      return {
        rule,
        multiplier: highestMultiplier,
      };
    }
  } catch (error) {
    console.log(error);

    return {
      rule,
      error: "Bot not in guild",
    };
  }

  return {
    rule,
    error: "Bot not in guild",
  };
};

export const checkDiscordRoleRules = async (
  accounts: Account[],
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { discordRoleRule } = rule;
  if (!discordRoleRule) return { rule };

  const userDiscordAccount = accounts.find(
    (account: Account) => account.provider === OAuthProviders.DISCORD
  );

  if (!userDiscordAccount) {
    return {
      rule,
      error: "You must connect your Discord account to enter",
    };
  }

  // use bot method to get guild member details
  const botResult = await botGetDiscordMemberDetails(
    userDiscordAccount.providerAccountId,
    discordRoleRule,
    rule
  );

  if (botResult && !botResult.error) {
    return botResult;
  }

  if (botResult && botResult.error && botResult.error !== "Bot not in guild") {
    return botResult;
  }

  // fallback to user method

  try {
    const response = await fetch(
      `https://discord.com/api/users/@me/guilds/${discordRoleRule.guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${userDiscordAccount.access_token}`,
        },
      }
    );
    const resJson = await response.json();

    if (resJson.message && resJson.message === "You are being rate limited.") {
      console.log("rate limited on role checks", resJson);

      return {
        rule,
        error: `You are being rate limited by discord, please try again in ${resJson.retry_after} seconds. If this error persists, please raise an issue with the server owner.`,
      };
    }

    if (Object.keys(resJson).includes("code")) {
      if (resJson.message && resJson.message === "Unknown Guild") {
        return {
          rule,
          error:
            "You are not in the required discord server, this error may occur if the giveaway manager has configured the server incorrectly. Please raise an issue with the server owner.",
        };
      }
      return {
        rule,
        error: "Something went wrong, relinking your Discord account may help.",
      };
    }

    let highestMultiplier: null | number = null;
    discordRoleRule.roles.forEach((role) => {
      if (
        (resJson.roles.includes(role.role.id) &&
          role.type === DiscordRoleRuleType.HAVE_ROLE) ||
        (!resJson.roles.includes(role.role.id) &&
          role.type === DiscordRoleRuleType.DONT_HAVE_ROLE)
      ) {
        if (highestMultiplier === null) {
          highestMultiplier = role.role.multiplier;
        } else if (role.role.multiplier > highestMultiplier) {
          highestMultiplier = role.role.multiplier;
        }
      }
    });

    if (highestMultiplier === null) {
      return {
        rule,
        error: `You do not have any of the roles required to enter this giveaway`,
      };
    }

    return {
      rule,
      multiplier: highestMultiplier,
    };
  } catch (error) {
    console.log(error);

    return {
      rule,
      error: "Could not check roles, relinking your discord account may help",
    };
  }
};
