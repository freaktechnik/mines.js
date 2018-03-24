const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OfflinePlugin = require("offline-plugin");
const path = require("path");

const pageTitles = require("./pages/titles.json");
const pkg = require("./package.json");

const pages = Object.keys(pageTitles);

const entry = {};
const plugins = [
    new CleanPlugin([ 'dist' ]),
    new MiniCssExtractPlugin({
        filename: "styles/[name]-[hash].css"
    }),
    new OfflinePlugin({
        ServiceWorker: {
            entry: './assets/sw/global-events.js',
            events: true,
            minify: false
        },
        AppCache: false
    })
];

for(const p of pages) {
    entry[p] = "./pages/" + p;
    plugins.push(new HtmlWebpackPlugin({
        filename: p + ".html",
        template: "./assets/page.html",
        chunks: [ "common", p ],
        defaultLanguage: "en",
        page: p,
        titleId: pageTitles[p],
        version: pkg.version,
        debug: false
    }));
}

module.exports = {
    entry: entry,
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/mines/",
        filename: "scripts/[name]-[hash].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [ 'env' ],
                    babelrc: false
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
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
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /fonts/,
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
                loader: "file-loader",
                options: {
                    name: "fonts/[name].[ext]"
                }
            },
        ],
        noParse: [ /~$/, /assets\/.*\.html$/ ]
    },
    plugins: plugins,
    node: {
        Buffer: false
    }
};
