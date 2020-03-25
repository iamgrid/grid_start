const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/app.js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.template.html",
			title: "grid.start"
		})
	],
	output: {
		filename: "[name]-[hash].min.js",
		chunkFilename: "[name]-[hash].chunk.js",
		path: path.resolve(__dirname, "dist"),
		hashDigestLength: 8
	},
	mode: "production",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			}
		]
	}
};
