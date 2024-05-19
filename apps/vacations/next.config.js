const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
const webpack = require('webpack');

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config, { isServer }) => {
      if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
      }
      return config;
  },
};
