const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/src/index.html',
  filename: 'index.html',
  inject: 'body'
});

const ExtractTextPluginConfig = new ExtractTextPlugin('style.css');

const entrypoint = process.env.npm_lifecycle_event === 'dev' ?
  'webpack-dev-server/client?http://localhost:8080' :
  './src/index.js';

module.exports = {
  entry: entrypoint,
  devServer: {
    contentBase: path.join(__dirname, "../dist/"),
    port: 9000
  },
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: __dirname + '/src',
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.scss$/,
        include: __dirname + '/src',
        loader: ExtractTextPlugin.extract('css!sass')
      },
      {
        test: /\.(gif|svg|jpg|jpeg|png)$/,
        loader: "file-loader",
      }
    ],
    rules: [
      {
          test: /\.(png|jp(e*)g|svg)$/,
          use: [{
              loader: 'url-loader',
              options: {
                  limit: 8000, // Convert images < 8kb to base64 strings
                  name: 'img/[hash]-[name].[ext]'
              }
          }]
      }
    ]
  },
  plugins: [HtmlWebpackPluginConfig, ExtractTextPluginConfig,
    new CopyWebpackPlugin([
      { from: 'src/img', to: 'images' }
    ])
  ]
}
