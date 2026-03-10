// webpack.dev.js
const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "dist"),
      },
      {
        directory: path.join(__dirname, "src/model"),
        publicPath: "/model",
      },
      {
        directory: path.join(__dirname, "src/public"),
        publicPath: "/",
      },
    ],
    compress: true,
    port: 8080,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    historyApiFallback: true,
  },
  // cobain
  // plugins: [
  //     new MiniCssExtractPlugin(),
  //     new WorkboxWebpackPlugin.GenerateSW({
  //       swDest: "sw.bundle.js",
  //       maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50 MB
  //       runtimeCaching: [
  //         {
  //           urlPattern: ({ request }) => request.destination === "document",
  //           handler: "NetworkFirst",
  //           options: { cacheName: "documents" },
  //         },
  //         {
  //           urlPattern: ({ request }) => request.destination === "script" || request.destination === "style",
  //           handler: "StaleWhileRevalidate",
  //           options: { cacheName: "static-resources" },
  //         },
  //         {
  //           urlPattern: ({ url }) => url.pathname.startsWith("/model/"),
  //           handler: "CacheFirst",
  //           options: { cacheName: "model-cache" },
  //         },
  //         {
  //           urlPattern: ({ request }) => request.destination === "image",
  //           handler: "CacheFirst",
  //           options: { cacheName: "images" },
  //         },
  //       ],
  //     }),
  //   ],
});