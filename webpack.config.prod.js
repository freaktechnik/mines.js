const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const OfflinePlugin = require("offline-plugin");
const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const path = require("path");

const pageTitles = require("./pages/titles.json");
const pkg = require("./package.json");

const pages = Object.keys(pageTitles);

const entry = {};
const plugins = [
    new CleanPlugin([ 'dist' ]),
    new LoaderOptionsPlugin({
        debug: false,
        minimize: true
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
    new UglifyJsPlugin({
        compress: {
            warnings: true
        },
        output: {
            comments: false
        },
        sourceMap: false,
        minimize: true
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
                    presets: [ 'es2015' ],
                    babelrc: false
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader',
                    publicPath: '../'
                })
            },
            {
                test: /\.html$/,
                loader: 'ejs-loader?variable=data'
            },
            {
                test: /manifest.json$/,
                use: [
                    'file-loader?name=manifest.json',
                    'web-app-manifest-loader',
                    'manifest-scope-loader'
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: /fonts/,
                use: [
                    "file-loader?name=images/[name].[ext]",
                    "image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&progressive=true&gifsicle.interlaced=true"
                ]
            },
            {
                test: /locales\/[a-z]{2}\/[a-z]+\.properties$/,
                use: [
                    "file-loader?name=[path][name].[ext]",
                    "transifex-loader"
                ]
            },
            {
                test: /\.(txt|eot|ttf|svg|woff|woff2)$/,
                loader: "file-loader?name=fonts/[name].[ext]"
            },
        ],
        noParse: [/~$/, /assets\/.*\.html$/]
    },
    plugins: plugins,
    node: {
        Buffer: false
    }
};
