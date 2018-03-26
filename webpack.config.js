const webpack = require('webpack');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'client/src');
const DIST_DIR = path.resolve(__dirname, 'client/dist');
const NODE_MODULES = path.resolve(__dirname, 'node_modules');

const commonSettings = {
  context: SRC_DIR,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: [SRC_DIR],
        exclude: [NODE_MODULES],
        loader: 'babel-loader',
        query: {
          presets: ['react', 'env'],
        },
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     'css-loader'
      //   ],
      // },
    ],
  },
};

const clientSideBundleSettings = Object.assign(
  {},
  commonSettings,
  {
    entry: './index.client.js',
    output: {
      path: DIST_DIR,
      filename: 'app.client.js',
    },
  },
);

const serverSideBundleSettings = Object.assign(
  {},
  commonSettings,
  {
    entry: './index.node.js',
    target: 'node',
    output: {
      path: DIST_DIR,
      filename: 'app.node.js',
      libraryTarget: 'commonjs-module',
    },
  },
);

module.exports = [
  clientSideBundleSettings,
  serverSideBundleSettings,
];
