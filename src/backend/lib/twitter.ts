import { Account } from "@prisma/client";
import TwitterApi from "twitter-api-v2";

export const twitterClientForUser = (userTwitterAccount: Account) => {
  return new TwitterApi({
    appKey: process.env.TWITTER_CLIENT_ID,
    appSecret: process.env.TWITTER_CLIENT_SECRET,
    accessToken: userTwitterAccount.oauth_token as string,
    accessSecret: userTwitterAccount.oauth_token_secret as string,
  });
};
