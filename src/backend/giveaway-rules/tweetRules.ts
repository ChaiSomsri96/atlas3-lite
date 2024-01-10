import { RuleResult } from "./types";
import { Account, GiveawayRule, TwitterActionType } from "@prisma/client";
import { OAuthProviders } from "@/shared/types";

export const checkTweetRules = async (
  accounts: Account[],
  rule: GiveawayRule
): Promise<RuleResult> => {
  const { twitterTweetRule } = rule;
  if (!twitterTweetRule) return { rule };

  const userTwitterAccount = accounts.find(
    (account: Account) => account.provider === OAuthProviders.TWITTER
  );

  if (!userTwitterAccount) {
    return {
      rule,
      error: "You must connect your Twitter account to enter",
    };
  }

  console.log("Checking tweet", rule);
  const actions = twitterTweetRule.actions;

  actions.forEach(async (action) => {
    if (!Object.keys(TwitterActionType).includes(action)) {
      return {
        rule,
        error: `Invalid action ${action}`,
      };
    }
  });

  /*try {
    if (actions.includes(TwitterActionType.LIKE)) {
      const favoriteTimeline = await client.v1.favoriteTimeline(
        userTwitterAccount.providerAccountId,
        {
          count: 1,
          max_id: BigNumber.from(twitterTweetRule.tweetId).add(1).toString(),
          since_id: BigNumber.from(twitterTweetRule.tweetId).sub(1).toString(),
        }
      );

      if (
        !favoriteTimeline.data.find(
          (tweet) => tweet.id_str === twitterTweetRule.tweetId
        )
      ) {
        return {
          rule,
          error: `You must like the tweet to enter`,
        };
      }
    }

    if (actions.includes(TwitterActionType.RETWEET)) {
      /*   const userTweets = await client.v1.userTimeline(
        userTwitterAccount.providerAccountId,
        {
          count: 50,
          include_rts: true,
        }
      );

      console.log(userTweets);

      if (
        !userTweets.tweets.find(
          (tweet) =>
            tweet.retweeted_status &&
            tweet.retweeted_status.id_str === twitterTweetRule.tweetId
        )
      ) {
        return {
          rule,
          error: `You must retweet the tweet to enter`,
        };
      }
      return {
        rule,
        error: `You must retweet the tweet to enter`,
      };
      
    }
      const favoriteTimeline = await client.v1.favoriteTimeline(
        userTwitterAccount.providerAccountId,
        {
          count: 1,
          max_id: BigNumber.from(twitterTweetRule.tweetId).add(1).toString(),
          since_id: BigNumber.from(twitterTweetRule.tweetId).sub(1).toString(),
        }
      );

      if (
        !favoriteTimeline.data.find(
          (tweet) => tweet.id_str === twitterTweetRule.tweetId
        )
      ) {
        return {
          rule,
          error: `You must retweet the tweet to enter`,
        };
      }
    }

    if (actions.includes(TwitterActionType.QUOTE)) {
      const userTimeline = await client.v1.userTimeline(
        userTwitterAccount.providerAccountId,
        {
          count: 3,
          include_rts: true,
        }
      );

      if (
        !userTimeline.tweets.find(
          (tweet) =>
            tweet.quoted_status &&
            tweet.quoted_status.id_str === twitterTweetRule.tweetId
        )
      ) {
        return {
          rule,
          error: `You must quote the tweet to enter`,
        };
      }
    }
  } catch (error) {
    console.log(error);

    return {
      rule,
      error: `Error checking tweet rule, relinking your Twitter account may fix this`,
    };
  }*/

  return {
    rule,
  };
};
