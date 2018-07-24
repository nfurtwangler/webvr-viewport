var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  {
    mode: 'production',
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
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        }
      ]
    }
  },
  {
    mode: 'production',
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
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        }
      ]
    }
  },
  {
    mode: 'production',
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
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          loader: ['style-loader', 'css-loader'],
        }
      ]
    }
  },
  {
    mode: 'production',
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
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          loader: ['style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          loader: ['file-loader'],
        }
      ]
    }
  },
  {
    mode: 'production',
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
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          loader: ['style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          loader: ['file-loader'],
        }
      ]
    },
  },
  {
    mode: 'production',
    entry: './webrtc.ts',
    context: __dirname + '/src/samples/webrtc',
    output: {
      path: __dirname + '/bin/samples/webrtc/',
      filename: 'webrtc.js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.png', '.jpg'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './webrtc.template.ejs',
        inject: 'head'
      }),
      new CopyWebpackPlugin([{
        from: './static_assets',
        to: './assets'
      }])
    ],
    devtool: 'source-map',
    devServer: {
      publicPath: '/bin/'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [
            /node_modules/
          ],
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          loader: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpg|png)$/,
          loader: ['file-loader'],
        }
      ]
    },
  },
];
