const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: {
		app: "./src/app.js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.template.html",
			title: "grid.start"
		}),
		new CopyPlugin([
			{ from: "src/wallpapers", to: "wallpapers" },
			{ from: "src/export_json.php", to: "export_json.php" }
		])
	],
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
