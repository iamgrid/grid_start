const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
	plugins: [new CleanWebpackPlugin()],
	output: {
		filename: "[name]-[contenthash].min.js",
		chunkFilename: "[name]-[contenthash].chunk.js",
		path: path.resolve(__dirname, "dist"),
		hashDigestLength: 8
	},
	mode: "production",
	devtool: "source-map"
});
