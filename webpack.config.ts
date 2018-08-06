import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as ExtractCssPlugin from "mini-css-extract-plugin";
import * as path from "path";
import * as webpack from "webpack";

require("dotenv").config({ silent: true });

const envDefaults = {
  DEV_SERVER_PORT: 8080,
  API_HOST: "http://localhost:9090",
  PUBLIC_PATH: "/",
};

const outputPath = path.resolve(__dirname, "public");

const baseConfig: webpack.Configuration = {
  entry: {
    app: ["./src/index.tsx", path.resolve(__dirname, "node_modules", "sanitize.css")], // TODO: make this more flexible
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        loader: "tslint-loader",
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              plugins: ["react-hot-loader/babel"],
            },
          },
          "ts-loader",
        ],
        exclude: "/node_modules/",
      },
      {
        test: /\.(css|scss)$/,
        use: [
          process.env.NODE_ENV === "production" ? ExtractCssPlugin.loader : "style-loader", // Extract CSS text
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              minimize: true,
            },
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader?name=img/[name].[ext]"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader?name=fonts/[name].[ext]"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js?=[hash:6]",
    path: outputPath,
    publicPath: process.env.PUBLIC_PATH || envDefaults.PUBLIC_PATH,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};

const buildConfig: webpack.Configuration = {
  mode: "production",
  entry: baseConfig.entry,
  module: baseConfig.module,
  resolve: baseConfig.resolve,
  output: baseConfig.output,
  optimization: baseConfig.optimization,
  plugins: [
    new CleanWebpackPlugin([outputPath]),
    new ExtractCssPlugin({ filename: "[name].css?=[hash:6]" }),
    ...(baseConfig.plugins || []),
  ],
};

const devConfig: webpack.Configuration = {
  mode: "development",
  entry: baseConfig.entry,
  devtool: "inline-source-map",
  module: baseConfig.module,
  resolve: baseConfig.resolve,
  output: baseConfig.output,
  optimization: baseConfig.optimization,
  devServer: {
    contentBase: outputPath,
    compress: true,
    port: parseInt(process.env.DEV_SERVER_PORT || "") || envDefaults.DEV_SERVER_PORT,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: process.env.API_HOST || envDefaults.API_HOST,
        xfwd: true,
        changeOrigin: true,
      },
    },
  },
  performance: { hints: false },
  plugins: baseConfig.plugins,
};

switch (process.env.npm_lifecycle_event) {
  case "build":
    module.exports = buildConfig;
    break;
  default:
    module.exports = devConfig;
    break;
}
