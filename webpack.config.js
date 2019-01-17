const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({
  filename: 'main.css',
});

module.exports = {
  entry: [
    'babel-polyfill',
    './src/js/app.js',
    './src/scss/main.scss',
    './src/vendors/mdb/scss/mdb.scss',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.js?$/,
        exclude: [/node_modules/, /vendors/], // Don't lint MDB
        loader: 'eslint-loader',
        options: {
          fix: true,
        },
      },
      {
        test: require.resolve('./src/js/tableauwdc-2.3.latest.min.js'),
        use: 'exports-loader?tableau',
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /vendors/],
        use: [
          {
            loader: 'babel-loader',
            // options: {
            //   presets: ['env','@babel/preset-env'],
            // },
          },
        ],
      },
      {
        test: /.scss?$/,
        use: extractPlugin.extract({
          use: ['css-loader', 'sass-loader'],
        }),
      },
      {
        test: /.html$/,
        use: ['html-loader'],
      },
      // Font-awesome 4.7.X
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: [/vendors/, /img/],
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      // MDB Roboto font
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: [/node_modules/, /img/],
        loader: 'file-loader?name=font/roboto/[name].[ext]',
      },
      {
        test: /.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          useRelativePath: true,
        },
      },
    ],
  },
  plugins: [
    extractPlugin,
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
      Waves: 'node-waves',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([{ from: 'src/vendors/mdb/mdb-addons', to: 'mdb-addons' }]),
    new CopyWebpackPlugin([{ from: 'src/img', to: 'img' }]),
    new CopyWebpackPlugin([{ from: 'now.json', to: 'now.json' }]),
    new CopyWebpackPlugin([{ from: 'src/api', to: 'api' }]),
    new CopyWebpackPlugin([{ from: 'src/js/async.min.js', to: 'js/async.min.js' }]),
    new CopyWebpackPlugin([{ from: 'src/js/schema.js', to: 'js/schema.js' }]),
    new CopyWebpackPlugin([{ from: 'src/js/tableauwdc-2.3.latest.min.js', to: 'js/tableauwdc-2.3.latest.min.js' }]),
    new CopyWebpackPlugin([{ from: 'package-deploy.json', to: 'package.json' }]),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: './src',
  },
  target: 'web',
};
