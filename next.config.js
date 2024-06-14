/** @type {import('next').NextConfig} */

const packageJson = require('./package.json');

const nextConfig = {
  output: "export",
  distDir: "dist",
  reactStrictMode: false,

  experimental: {
    webpackBuildWorker: true,
  },

  images: {
    unoptimized: true,
  },

  env: {
    APP_VERSION: packageJson.version,
  },

  webpack: (config) => {
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    config.experiments.asyncWebAssembly = true;
    return config;
  },
}

module.exports = nextConfig
