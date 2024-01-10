import { OAuthProviders } from "@/shared/types";
import { Account, GiveawayRule } from "@prisma/client";
import { RuleResult } from "./types";

export const checkFriendshipRules = async (
  accounts: Account[],
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { twitterFriendshipRule } = rule;
  if (!twitterFriendshipRule) return { rule };

  const userTwitterAccount = accounts.find(
    (account: Account) => account.provider === OAuthProviders.TWITTER
  );

  if (!userTwitterAccount) {
    return {
      rule,
      error: "You must connect your Twitter account to enter",
    };
  }

  try {
    //   console.log('test')
    //  const followers = await client.v2.followers(userTwitterAccount.userId);

    //  console.log(followers);

    /* for (const r of relationships) {
      switch (r) {
        case TwitterFriendshipRuleType.FOLLOW:
          if (!relationship.source.following) {
            return {
              rule,
              error: `You must follow @${twitterFriendshipRule.username} to enter`,
            };
          }
          break;

        case TwitterFriendshipRuleType.FOLLOWED_BY:
          if (!relationship.source.followed_by) {
            return {
              rule,
              error: `@${twitterFriendshipRule.username} must follow you to enter`,
            };
          }
          break;

        case TwitterFriendshipRuleType.NOTIFICATIONS_ON:
          if (!relationship.source.notifications_enabled) {
            return {
              rule,
              error: `You must have notifications on for @${twitterFriendshipRule.username} to enter`,
            };
          }
          break;

        default:
          return {
            rule,
            error: `Unknown friendship rule type ${r}`,
          };
      }
    }*/
    return {
      rule,
    };
  } catch (error) {
    console.log(error);

    return {
      rule,
      error:
        "Could not check friendship, relinking your Twitter account may help",
    };
  }
};
