import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  output: "export",
  trailingSlash: true,
  ...(isGithubPages && basePath
    ? {
        assetPrefix: `${basePath}/`,
        basePath,
      }
    : {}),
};

export default nextConfig;
