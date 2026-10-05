import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false, // Disables Next.js "1 Issue / 2 Issues" dev indicator badge overlay from rendered screen
};

export default nextConfig;
