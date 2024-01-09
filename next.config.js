/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_VAULT_PUBLIC_KEY:
      "8XHSXQVheGRZxpzvfv5fY82z2WKXbWBaHJSmhBjaRg88",
    NEXT_PUBLIC_VAULT_PUBLIC_KEY_POINTS:
      "DBVbWqFMTm1krvaGcQPLtjVno2zBgs9e4NKtiCKTAoyN",
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-MECS40L72G",
    NEXT_PUBLIC_TWITTER_OAUTH2_CLIENT_ID: "NU5RVXhJWFVWaFo3dWdmXzNIazE6MTpjaQ",
    NEXT_PUBLIC_DISCORD_CLIENT_ID: "893428577608019978",
    NEXT_PUBLIC_FORGE_MINT: "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds",
    NEXT_PUBLIC_USDC_MINT: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    NEXT_PUBLIC_VAULT_PUBLIC_KEY_FORGE_STAKED:
      "3sBJMndMnvEuQYDAXrpU6WimMaZNxkkzSKz81KZ5vUoP",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "assets.meegos.io",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "assets.meegos.io",
        pathname: "**/*.jpgs",
      },
      {
        protocol: "https",
        hostname: "assets.meegos.io",
        pathname: "**/*.gif",
      },
      {
        protocol: "https",
        hostname: "dqcwm7d2v61k3.cloudfront.net",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "dqcwm7d2v61k3.cloudfront.net",
        pathname: "**/*.jpg",
      },
      {
        protocol: "https",
        hostname: "metadata.smyths.io",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "atlas3-public.s3.amazonaws.com",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        pathname: "**/*.png",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
        pathname: "**/*.jpg",
      },
    ],
  },
  generateBuildId: () => {
    if ("$Format:%H$".startsWith("$")) {
      return "static-build-id";
    }
    return "$Format:%H$";
  },
};

module.exports = nextConfig;
