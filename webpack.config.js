const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: './src/main.ts',
    output: {
        path: path.resolve(__dirname, 'app/static'),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: [
                    'ts-loader'
                ],
            },
            {
                test: /\.(css|scss)$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'bundle.css',
        }),
        new HtmlWebpackPlugin({
            template: './src/bundles.ejs',
            filename: '../templates/snippets/bundles.j2',
            hash: true,
            minify: {
                collapseWhitespace: true,
                preserveLineBreaks: true,
                removeComments: true,
            },
            inject: false,
        }),
    ],
    resolve: {
        extensions: ['.css', '.scss', '.js', '.ts'],
    },
};
