var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    entry: './src/webvr-viewport/webvr-viewport.js',
    output: {
      path: './bin/webvr-viewport/',
      publicPath: '/bin/webvr-viewport/',
      filename: 'webvr-viewport.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel', 'eslint'],
        }
      ],
    },
  },
  {
    entry: './src/samples/samples.js',
    output: {
      path: './bin/samples/',
      publicPath: '/bin/samples/',
      filename: 'samples.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel', 'eslint'],
        },
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
        },
        {
          test: /\.jpg$/,
          loaders: ['file'],
        },
      ],
    },
  },
  {
    entry: './src/samples/hello-world/hello-world.js',
    output: {
      path: './bin/samples/hello-world/',
      publicPath: '/bin/samples/hello-world/',
      filename: 'hello-world.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    plugins: [new HtmlWebpackPlugin({
      title: 'Hello webvr-viewport',
    })],
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel', 'eslint'],
        },
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
        },
        {
          test: /\.jpg$/,
          loaders: ['file'],
        },
      ],
    },
  },
];
