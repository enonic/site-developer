var webpack = require("webpack");

module.exports = {
    output: {
        filename: 'main.min.js'
    },
    resolve: {
        alias: {
            //jquery: __dirname + "/src/main/resources/site/assets/js/vendor/jquery/jquery-1.11.3.min.js"
            //Get this from node_modules instead
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
};