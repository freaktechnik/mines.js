const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
const OfflinePlugin = require("offline-plugin");

const pageTitles = require("./pages/titles.json");
const pkg = require("./package.json");

const pages = Object.keys(pageTitles);

const entry = {};
const plugins = [
    new CleanPlugin([ 'dist' ]),
    new CommonsChunkPlugin({
        name: "common",
        filename: "scripts/common.min.js"
    }),
    new ExtractTextPlugin("styles/[name]-[hash].css"),
    new ProvidePlugin({
        _: "underscore",
        'window.jQuery': 'jquery'
    }),
    new UglifyJsPlugin(),
    new OfflinePlugin({
        ServiceWorker: {
            entry: './assets/sw/global-events.js'
        },
        AppCache: false
    })
];

for(let p of pages) {
    entry[p] = "./pages/"+p;
    plugins.push(new HtmlWebpackPlugin({
        filename: p+".html",
        template: "./assets/page.ejs",
        chunks: [ "common", p ],
        defaultLanguage: "en",
        page: p,
        titleId: pageTitles[p],
        version: pkg.version
    }));
}

module.exports = {
    entry: entry,
    output: {
        path: "dist",
        filename: "scripts/[name]-[hash].min.js",
        publicPath: "/mines.js/"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: [ 'es2015' ]
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css')
            },
            {
                test: /\.html$/,
                loader: 'ejs?variable=data'
            },
            {
                test: /manifest.json$/,
                loader: 'file?name=manifest.json!web-app-manifest-loader'
            },
            {
                test: /\.json$/,
                exclude: /manifest.json$/,
                loader: 'json'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /font/,
                loader: "file?name=images/[name].[ext]"
            },
            {
                test: /\.properties$/,
                context: 'locales',
                loader: "file?name=[path][name].[ext]"
            },
            {
                test: /\.(txt|eot|ttf|svg|woff|woff2)$/,
                loader: "file?name=font/[name].[ext]"
            },
        ],
        noParse: /~$/
    },
    plugins: plugins,
    node: {
        Buffer: false
    }
};
