declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    TWITTER_CLIENT_ID: string;
    TWITTER_CLIENT_SECRET: string;
    NEXT_PUBLIC_DISCORD_CLIENT_ID: string;
    NEXT_PUBLIC_VAULT_PUBLIC_KEY: string;
    NEXT_PUBLIC_FORGE_MINT: string;
    NEXT_PUBLIC_VAULT_PUBLIC_KEY_POINTS: string;
    NEXT_PUBLIC_VAULT_PUBLIC_KEY_FORGE_STAKED: string;
    NEXT_PUBLIC_USDC_MINT: string;
    DISCORD_CLIENT_SECRET: string;
    TX_LISTENER_KEY: string;

    APP_AWS_ACCESS_KEY_ID: string;
    APP_AWS_ACCESS_KEY_SECRET: string;

    S3_UPLOAD_KEY: string;
    S3_UPLOAD_SECRET: string;
    S3_UPLOAD_BUCKET: string;
    S3_UPLOAD_REGION: string;
  }
}
