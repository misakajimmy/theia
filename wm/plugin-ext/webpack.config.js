const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './lib/plugin/webworker/ds-api-worker-provider.js',
    devtool: 'source-map',
    mode: 'production',
    node:{
        fs: 'empty',
        child_process: 'empty',
        net: 'empty',
        crypto: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['lib/webworker'])
    ],
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'ds-api-worker-provider.js',
        libraryTarget: "var",
        library: "ds_api_provider",
        path: path.resolve(__dirname, 'lib/webworker')
    }
}
