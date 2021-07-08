/*********************************************************************
* Copyright (c) 2018 Red Hat, Inc.
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
**********************************************************************/

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Uglify = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/waffle-nano-mpy-frontend.ts',
    devtool: 'source-map',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ],
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'waffle-nano-mpy-frontend.js',

        libraryTarget: "var",
        library: "theia_waffle_nano_mpy",

        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        "@wm/plugin": "wm.plugin",
        "@theia/plugin": "theia.plugin"
    },
    optimization: {
        minimizer: [new Uglify()],
    },
};
