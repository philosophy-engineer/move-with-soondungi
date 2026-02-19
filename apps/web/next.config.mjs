import process from "node:process";

/** @type {import('next').NextConfig} */
const apiOriginUrl = process.env.API_ORIGIN_URL?.trim().replace(/\/+$/, "");

const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    if (!apiOriginUrl) {
      return [];
    }

    return [
      {
        source: "/api/healthz",
        destination: `${apiOriginUrl}/healthz`,
      },
      {
        source: "/api/:path*",
        destination: `${apiOriginUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
