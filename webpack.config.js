var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    entry: './webvr-viewport.ts',
    context: __dirname + '/src/webvr-viewport/',
    output: {
      path: __dirname  + '/bin/webvr-viewport/',
      filename: 'webvr-viewport.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
      ],
    },
  },
  {
    entry: './webvr-viewport-effect.ts',
    context: __dirname + '/src/webvr-viewport-three/',
    output: {
      path: __dirname  + '/bin/webvr-viewport-three/',
      filename: 'webvr-viewport-effect.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
      ],
    },
  },
  {
    entry: './index.ts',
    context: __dirname + '/src/samples/index',
    output: {
      path: __dirname  + '/bin/samples/index',
      filename: 'index.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    plugins: [new HtmlWebpackPlugin({
      template: './index.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        }
      ],
    },
  },
  {
    entry: './hello-world.ts',
    context: __dirname + '/src/samples/hello-world/',
    output: {
      path: __dirname + '/bin/samples/hello-world/',
      filename: 'hello-world.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    plugins: [new HtmlWebpackPlugin({
      template: './hello-world.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          loaders: ['file-loader'],
        },
      ],
    },
  },
  {
    entry: './hello-three.ts',
    context: __dirname + '/src/samples/hello-three/',
    output: {
      path: __dirname + '/bin/samples/hello-three/',
      filename: 'hello-three.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    plugins: [new HtmlWebpackPlugin({
      template: './hello-three.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          loaders: ['file-loader'],
        },
      ],
    },
  },
  {
    entry: './input.ts',
    context: __dirname + '/src/samples/input',
    output: {
      path: __dirname + '/bin/samples/input/',
      filename: 'input.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    plugins: [new HtmlWebpackPlugin({
      template: './input.template.ejs',
      inject: 'head'
    })],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loaders: ['ts-loader'],
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpg|png)$/,
          loaders: ['file-loader'],
        },
      ],
    },
  },
];
