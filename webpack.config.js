const path = require ("path");
const webpack = require ("webpack");
const extract = require ("extract-text-webpack-plugin")

const BUILD_DIR = path.resolve ( path.join ( __dirname, "build" ) )
const SOURCE_DIR = path.resolve ( path.join ( __dirname, "src" ) )
const PACKAGE_PATH = "JetRails/Cloudflare"

module.exports = {
	entry: `${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js/index.js`,
	output: {
		path: BUILD_DIR,
		filename: "bundle.js"
	},
	resolve: {
		modules: [
			path.resolve ( path.join ( __dirname, "node_modules" ) )
		],
		alias: {
			cloudflare: `${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js`
		}
	},
	stats: {
		assets: false,
		children: false,
		chunks: false,
		hash: false,
		modules: false,
		publicPath: false,
		timings: false,
		version: false,
		warnings: true
	}
}
