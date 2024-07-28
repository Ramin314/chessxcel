const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './src/javascript/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '[name].js',
  },
  cache: true,
  mode: 'development',
  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },

  plugins: [
    new DotenvWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),
    new CopyPlugin({
      patterns: [
        { from: './node_modules/stockfish.js/stockfish.js', to: './stockfish.js' },
        { from: './node_modules/stockfish.js/stockfish.wasm', to: './stockfish.wasm' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],

  watchOptions: {
    ignored: /node_modules/,
  },

  devServer: {
    static: path.resolve(__dirname, "./src"),
    open: true,
    hot: true,
    port: 8000,
    historyApiFallback: true,
    client: {
      overlay: false,
    },
  },
};
