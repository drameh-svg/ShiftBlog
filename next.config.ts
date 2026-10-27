import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.agent.cvm.dev"],
  outputFileTracingIncludes: {
    "/**": ["./prisma/prod.db", "./prisma/schema.prisma"],
  },
};

export default nextConfig;
