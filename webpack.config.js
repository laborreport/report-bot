'use strict';

const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (env = {}) => {
    const config = {
        entry: ['babel-polyfill', './src/index.ts'],
        mode: env.development ? 'development' : 'production',
        target: 'node',
        externals: [nodeExternals()],
        resolve: {
            extensions: ['*', '.mjs', '.ts', '.js'],
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },

        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: 'javascript/auto',
                },
                {
                    test: /\.ts?$/,
                    loader: 'babel-loader',
                },
            ],
        },
        devtool: env.development ? 'source-map' : false,
        plugins: [
            new NodemonPlugin({
                nodeArgs: ['--inspect=49590', '--harmony', '--no-deprecation'],
            }),
        ],
    };
    return config;
};
