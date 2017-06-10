var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  {
    entry: './src/webvr-viewport/webvr-viewport.ts',
    context: './src/webvr-viewport/',
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
  },/*
  {
    entry: './src/webvr-viewport-three/webvr-viewport-effect.ts',
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
    entry: './src/samples/samples.ts',
    output: {
      path: __dirname  + '/bin/samples/',
      filename: 'samples.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
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
    entry: './src/samples/hello-world/hello-world.ts',
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
    entry: './src/samples/hello-three/hello-three.ts',
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
      template: './src/samples/hello-three/hello-three.template.ejs',
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
    entry: './src/samples/input/input.ts',
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
      template: './src/samples/input/input.template.ejs',
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
  },*/
];
