const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const OfflinePlugin = require("offline-plugin");

const pageTitles = require("./pages/titles.json");
const pkg = require("./package.json");

const pages = Object.keys(pageTitles);

const entry = {};
const plugins = [
    new CleanPlugin([ 'dist' ], {
        exclude: ['images', 'locales', 'fonts', 'manifest.json']
    }),
    new CommonsChunkPlugin({
        name: "common",
        filename: "scripts/common-[hash].js"
    }),
    new ExtractTextPlugin("styles/[name]-[hash].css"),
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
        filename: "scripts/[name]-[hash].js"
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
                loaders: [
                    'file?name=manifest.json',
                    'web-app-manifest',
                    'manifest-scope'
                ]
            },
            {
                test: /\.json$/,
                exclude: /manifest.json$/,
                loader: 'json'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /fonts/,
                loaders: [
                    "file?name=images/[name].[ext]",
                    "image-webpack?bypassOnDebug&optimizationLevel=7&progressive=true&interlaced=true"
                ]
            },
            {
                test: /\.properties$/,
                context: 'locales',
                loaders: [
                    "file?name=[path][name].[ext]",
                    "transifex"
                ]
            },
            {
                test: /\.(txt|eot|ttf|svg|woff|woff2)$/,
                loader: "file?name=fonts/[name].[ext]"
            },
        ],
        noParse: [/~$/, /assets\/.*\.html$/]
    },
    plugins: plugins,
    node: {
        Buffer: false
    }
};
