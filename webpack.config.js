const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const OfflinePlugin = require("offline-plugin");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const path = require("path");

const pageTitles = require("./pages/titles.json");
const pkg = require("./package.json");

const pages = Object.keys(pageTitles);

const entry = {};
const plugins = [
    new CleanPlugin([ 'dist' ], {
        exclude: [ 'images', 'locales', 'fonts', 'manifest.json' ]
    }),
    new CommonsChunkPlugin({
        name: "common",
        filename: "scripts/common-[hash].js"
    }),
    new ExtractTextPlugin({
        filename: "styles/[name]-[hash].css"
    }),
    new ProvidePlugin({
        _: "underscore",
        'window.jQuery': 'jquery'
    }),
    new OfflinePlugin({
        ServiceWorker: {
            entry: './assets/sw/global-events.js',
            events: true
        },
        AppCache: false
    }),
    new LoaderOptionsPlugin({
        debug: true,
        minimize: false
    })
];

for(const p of pages) {
    entry[p] = "./pages/" + p;
    plugins.push(new HtmlWebpackPlugin({
        filename: p + ".html",
        template: "./assets/page.ejs",
        chunks: [ "common", p ],
        defaultLanguage: "en",
        page: p,
        titleId: pageTitles[p],
        version: pkg.version,
        debug: true
    }));
}

module.exports = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, "dist"),
        pathinfo: true,
        filename: "scripts/[name]-[hash].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'test')
                ],
                loader: 'babel-loader',
                options: {
                    presets: [ 'es2015' ],
                    babelrc: false
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                    publicPath: "../"
                })
            },
            {
                test: /\.html$/,
                include: [
                    path.resolve(__dirname, 'pages'),
                    path.resolve(__dirname, 'assets')
                ],
                loader: 'ejs-loader',
                options: {
                    variable: 'data'
                }
            },
            {
                test: /manifest.json$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'manifest.json'
                        }
                    },
                    {
                        loader: 'web-app-manifest-loader'
                    },
                    {
                        loader: 'manifest-scope-loader'
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: path.resolve(__dirname, 'assets/font'),
                include: path.resolve(__dirname, 'assets'),
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "images/[name].[ext]"
                        }
                    },
                    {
                        loader: "image-webpack-loader",
                        options: {
                            bypassOnDebug: true,
                            "optipng.optimizationLevel": 7,
                            "mozjpeg.progressive": true,
                            "gifsicle.interlaced": true
                        }
                    }
                ]
            },
            {
                test: /locales\/[a-z]{2}\/[a-z]+\.properties$/,
                include: path.resolve(__dirname, 'locales'),
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[path][name].[ext]"
                        }
                    },
                    {
                        loader: "transifex-loader"
                    }
                ]
            },
            {
                test: /\.(txt|eot|ttf|svg|woff|woff2)$/,
                exclude: path.resolve(__dirname, 'assets/images'),
                loader: "file-loader",
                options: {
                    name: "fonts/[name].[ext]"
                }
            },
        ],
        noParse: [/~$/, /assets\/.*\.html$/]
    },
    plugins: plugins,
    node: {
        Buffer: false
    },
    devtool: "source-map"
};
