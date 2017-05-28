var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    entry: './src/webvr-viewport/webvr-viewport.js',
    output: {
      path: __dirname  + '/bin/webvr-viewport/',
      filename: 'webvr-viewport.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel-loader', 'eslint-loader'],
        }
      ],
    },
  },
  {
    entry: './src/samples/samples.js',
    output: {
      path: __dirname  + '/bin/samples/',
      filename: 'samples.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    plugins: [new HtmlWebpackPlugin({
      template: './src/samples/samples.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel-loader', 'eslint-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.jpg$/,
          loaders: ['file-loader'],
        },
      ],
    },
  },
  {
    entry: './src/samples/hello-world/hello-world.js',
    output: {
      path: __dirname + '/bin/samples/hello-world/',
      filename: 'hello-world.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    plugins: [new HtmlWebpackPlugin({
      template: './src/samples/hello-world/hello-world.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel-loader', 'eslint-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.jpg$/,
          loaders: ['file-loader'],
        },
      ],
    },
  },
];
