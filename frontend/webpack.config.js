const webpack = require("webpack");
const copyWebpackPlugin = require('copy-webpack-plugin')

const develBuild = process.env.TTY_SHARE_ENV === 'development';

let mainConfig  = {
    entry: {
        'tty-receiver': './tty-receiver/main.ts',
    },
    output: {
        path: __dirname + '/public/',
        filename: '[name].js'
    },
    mode: develBuild ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /node_modules.+xterm.+\.map$/,
                use: ['ignore-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
          {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  outputPath: 'fonts/',
                  esModule: false,
                  publicPath: '/static/fonts/'
                }
              }
            ]
          }
        ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new copyWebpackPlugin([
            'static',
            'templates',
        ], {
            debug: 'info',
        }),
    ],
};

if (develBuild) {
    mainConfig.devtool = 'inline-source-map';
}

module.exports = mainConfig;
