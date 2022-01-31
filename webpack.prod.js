const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
// const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
	optimization: {
		minimizer: [new TerserJSPlugin(), new CssMinimizerPlugin()],
	},
	plugins: [new CleanWebpackPlugin()],
	output: {
		filename: "[name]-[contenthash].bundle.js",
		chunkFilename: "[name]-[contenthash].chunk.js",
		path: path.resolve(__dirname, "dist"),
	},
	mode: "production",
});
