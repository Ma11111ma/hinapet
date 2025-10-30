import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  exclude: ["src/_trash/**/*"],
};

export default nextConfig;
