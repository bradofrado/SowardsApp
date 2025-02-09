const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  experimental: {
    swcPlugins: [
      [
        "harmony-ai-plugin",
        {
          rootDir: path.join(__dirname, "../.."),
          repositoryId: "ace93076-f918-4cf3-b8ee-221c4eef5870",
        },
      ],
    ],
  },
};
