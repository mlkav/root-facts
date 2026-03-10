const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: "sw.bundle.js",
      maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50 MB
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "document",
          handler: "NetworkFirst",
          options: { cacheName: "documents" },
        },
        {
          urlPattern: ({ request }) => request.destination === "script" || request.destination === "style",
          handler: "StaleWhileRevalidate",
          options: { cacheName: "static-resources" },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/model/"),
          handler: "CacheFirst",
          options: { cacheName: "model-cache" },
        },
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: { cacheName: "images" },
        },
      ],
    }),
  ],
});