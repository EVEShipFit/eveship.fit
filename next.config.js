/** @type {import('next').NextConfig} */
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

  webpack: (config) => {
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    config.experiments.asyncWebAssembly = true;
    return config;
  },
}

module.exports = nextConfig
