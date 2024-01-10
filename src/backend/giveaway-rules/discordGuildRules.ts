import { OAuthProviders } from "@/shared/types";
import { Account, DiscordGuildRule, GiveawayRule } from "@prisma/client";
import { RuleResult } from "./types";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const botGetDiscordMemberDetails = async (
  userId: string,
  discordGuildRule: DiscordGuildRule,
  rule: GiveawayRule
): Promise<RuleResult> => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${discordGuildRule.guildId}/members/${userId}`,
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

    if (resJson && resJson.message && resJson.message === "Unknown Member") {
      return {
        rule,
        error: `You need to be in the server ${discordGuildRule.guildName} to enter this giveaway`,
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

    if (resJson && resJson.user) {
      return {
        rule,
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

export const checkDiscordGuildRules = async (
  accounts: Account[],
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { discordGuildRule } = rule;
  if (!discordGuildRule) return { rule };

  try {
    const userDiscordAccount = accounts.find(
      (account: Account) => account.provider === OAuthProviders.DISCORD
    );

    if (!userDiscordAccount) {
      return {
        rule,
        error: "You need to link your discord account to enter this giveaway",
      };
    }

    // use bot method to get guild member details
    const botResult = await botGetDiscordMemberDetails(
      userDiscordAccount.providerAccountId,
      discordGuildRule,
      rule
    );

    if (botResult && !botResult.error) {
      return botResult;
    }

    if (
      botResult &&
      botResult.error &&
      botResult.error !== "Bot not in guild"
    ) {
      return botResult;
    }

    // fallback to user method

    let response = await fetch(`https://discord.com/api/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${userDiscordAccount.access_token}`,
      },
    });
    let resJson = await response.json();

    while (resJson && resJson.message && resJson.retry_after) {
      await sleep(resJson.retry_after * 1000);

      response = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${userDiscordAccount.access_token}`,
        },
      });
      resJson = await response.json();
    }

    if (resJson.message && resJson.message === "You are being rate limited.") {
      console.log("rate limited on guild checks", resJson);

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
        error:
          "Invalid Discord token, relinking your Discord account may help.",
      };
    }

    if (
      !resJson.find((g: { id: string }) => g.id === discordGuildRule?.guildId)
    ) {
      return {
        rule,
        error: `You need to be in the server ${discordGuildRule?.guildName} to enter this giveaway`,
      };
    } else {
      return {
        rule,
      };
    }
  } catch (error) {
    console.log(error);

    return {
      rule,
      error: "Could not check guilds, relinking your discord account may help",
    };
  }
};
