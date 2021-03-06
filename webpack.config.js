const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProd = process.env.NODE_ENV === 'production';
const minPostfix = isProd ? '.min' : '';
const minify = isProd ? 'minimize' : '';
const hash = '[hash:7]';

const entry = './src/app/js/entry.js';
const devEntry = [
  'webpack/hot/dev-server',
  'webpack-hot-middleware/client?reload=true',
  entry,
];
const basePlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  }),
  new HTMLWebpackPlugin({
    title: 'Library',
    template: 'src/app/index.html',
    // inject: false,
    prod: isProd,
    minify: isProd ? {
      removeComments: true,
      collapseWhitespace: true,
    } : null,
  }),
  // new BundleAnalyzerPlugin(),
];
const envPlugins = isProd ? [
  new ExtractTextPlugin(`css/style.${hash}${minPostfix}.css`, {
    allChunks: true,
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }),
  new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.css$|\.html$/,
    threshold: 10240,
    minRatio: 0.8,
  }),
  new webpack.BannerPlugin(`build: ${new Date().toString()}`),
] : [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  // @see https://www.npmjs.com/package/eslint-loader#noerrorsplugin
  new webpack.NoErrorsPlugin(),
];

module.exports = {
  debug: !isProd,
  devtool: !isProd ? '#eval' : null,

  entry: isProd ? entry : devEntry,

  output: {
    path: path.join(__dirname, 'lib/public'),
    filename: `js/app.${hash}${minPostfix}.js`,
    publicPath: '/',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: [
          'babel',
          // 'eslint',
        ],
        include: [
          path.join(__dirname, 'src/app/js'),
          path.resolve(__dirname, 'node_modules/amazeui-touch/js'),
        ],
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader',
      },
      {
        test: /\.scss/,
        loader: isProd ? ExtractTextPlugin.extract(
          'style',
          `css?${minify}!postcss!sass`
        ) : 'style!css?sourceMap!postcss!sass?sourceMap',
      },
      {
        test: /\.jpe?g$|\.gif$|\.png|\.ico$/,
        loaders: [
          'file?name=[path][name].[ext]&context=src/app',
          // 'image-webpack'
        ],
      },
      {
        test: /\.txt$|\.json$|\.webapp$/,
        loader: 'file?name=[path][name].[ext]&context=src/app',
      },
      {
        test: /\.svg$/,
        loader: 'url?mimetype=image/svg+xml&name=[name].[ext]',
      },
      {
        test: /\.woff$/,
        loader: 'url?mimetype=application/font-woff&name=[name].[ext]',
      },
      {
        test: /\.woff2$/,
        loader: 'url?mimetype=application/font-woff2&name=[name].[ext]',
      },
      {
        test: /\.[ot]tf$/,
        loader: 'url?mimetype=application/octet-stream&name=[name].[ext]',
      },
    ],
  },

  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
      'react-addons-css-transition-group': 'preact-css-transition-group',
    },
  },

  plugins: basePlugins.concat(envPlugins),

  // global mode
  // externals: {
  //   'react': 'React',
  //   'react-dom': 'ReactDOM',
  //   'react-addons-css-transition-group': ['React', 'addons', 'CSSTransitionGroup'],
  //   'amazeui-touch': 'AMUITouch',
  // },

  // loader config
  postcss: [autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'ie 10'] })],

  // @see https://www.npmjs.com/package/image-webpack-loader
  imageWebpackLoader: {},
};
