const HtmlWebPackPlugin = require("html-webpack-plugin");
module.exports = {
  output:{filename: "./dist/bundle.js"},
  entry: "./index.js",
  devtool: "source-map",
  resolve:{extensions: ["webpack.js", "web.js",".ts", "tsx", ".js"]},
  
  module: {
    rules: [
      {
        test: /\.html$/,use :[{loader:"html-loader",options:{minimize:true}}],
        test: /\.js$/, exclude: /node_modules/, use:[{loader:"source-map"}, {loader:"babel-loader"}],
        test: /\.tsx?$/, use:{loader:"awesome-typescript-loader"}
      }

    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "index.html",
      filename: "./index.html"
    })
  ]
};