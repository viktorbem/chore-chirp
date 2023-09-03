const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { DefinePlugin } = require('webpack');

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
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader',
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
        new VueLoaderPlugin(),
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
        new DefinePlugin({
            __VUE_PROD_DEVTOOLS__: true
        }),
    ],
    resolve: {
        alias: {
            'vue$': '@vue/runtime-dom',
        },
        extensions: ['.css', '.scss', '.js', '.ts', '.vue'],
    },
};
