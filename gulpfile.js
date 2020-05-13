const gulp = require ("gulp")
const concat = require ("gulp-concat")
const gzip = require ("gulp-gzip")
const magepack = require ("gulp-magepack")
const minify = require ("gulp-minify-css")
const minifyJs = require ("gulp-minify")
const replace = require ("gulp-replace")
const sass = require ("gulp-sass")
const tar = require ("gulp-tar")
const fs = require ("fs")
const fse = require ("fs-extra")
const path = require ("path")
const webpack = require ("webpack")
const webpackStream = require ("webpack-stream")

const PACKAGE_NAMESPACE = require ("./package.json").namespace
const PACKAGE_VERSION = require ("./package.json").version
const PACKAGE_PATH = PACKAGE_NAMESPACE.replace ( /_/g, "/" )

const SOURCE_DIR = "src"
const BUILD_DIR = "build"
const STAGING_DIR = "public_html"
const PACKAGE_DIR = "dist"

gulp.task ( "init", [], ( callback ) => {
	let mkdirNotExists = ( name ) => {
		if ( !fs.existsSync ( name ) ) {
			fs.mkdirSync ( name )
		}
	}
	mkdirNotExists ( BUILD_DIR )
	mkdirNotExists ( PACKAGE_DIR )
	mkdirNotExists ( STAGING_DIR )
	callback ()
})

gulp.task ( "clean", [], ( callback ) => {
	let unlinkExists = ( name ) => {
		if ( fs.existsSync ( name ) ) {
			fse.removeSync ( name )
		}
	}
	unlinkExists ( BUILD_DIR )
	unlinkExists ( PACKAGE_DIR )
	callback ()
})

gulp.task ( "bump", [], ( callback ) => {
	return gulp.src (`${SOURCE_DIR}/**/*`)
		.pipe ( replace ( /(^.*\*\s+@version\s+)(.+$)/gm, "$1" + PACKAGE_VERSION ) )
		.pipe ( gulp.dest ( SOURCE_DIR ) )
		.on ( "done", callback )
})

gulp.task ( "build-styles", ["init"], ( callback ) => {
	return gulp.src (`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss/index.scss`)
		.pipe ( sass ({ includePaths: `${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss` }) )
		.pipe ( minify () )
		.pipe ( concat ("bundle.min.css") )
		.pipe ( replace ( /src\/app\/code\/JetRails\/Cloudflare\/view\/adminhtml\/web\/scss\//g, "" ) )
		.pipe ( gulp.dest (`${BUILD_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/css`) )
		.pipe ( gulp.dest (`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/css`) )
		.on ( "done", callback )
})

gulp.task ( "build-scripts", ["init"], ( callback ) => {
	return gulp.src (`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js/index.js`)
		.pipe ( webpackStream ( require ("./webpack.config.js") ), webpack )
		.pipe ( minifyJs ({ ext: { min: ".min.js" } }) )
		.pipe ( gulp.dest (`${BUILD_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js`) )
		.pipe ( gulp.dest (`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js`) )
		.on ( "done", callback )
})

gulp.task ( "build", [ "build-styles", "build-scripts" ], ( callback ) => {
	let ignoreJs = [
		`!${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js`,
		`!${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/js/**/*`,
	]
	let ignoreCss = [
		`!${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss`,
		`!${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss/**/*`,
		`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss/fonts/**/*`
	]
	return gulp.src ( [`${SOURCE_DIR}/**`].concat ( ignoreJs ).concat ( ignoreCss ) )
		.pipe ( gulp.dest ( BUILD_DIR ) )
		.on ( "end", () => {
			fse.copySync (
				`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss/fonts`,
				`${BUILD_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/css/fonts`
			)
			fse.copySync (
				`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/scss/fonts`,
				`${SOURCE_DIR}/app/code/${PACKAGE_PATH}/view/adminhtml/web/css/fonts`
			)
		})
		.on ( "done", callback )
})

gulp.task ( "deploy", ["build"], ( callback ) => {
	return gulp.src (`${BUILD_DIR}/**/*`)
		.pipe ( gulp.dest ( STAGING_DIR ) )
		.on ( "done", callback )
})

gulp.task ( "watch", ["deploy"], () => {
	return gulp.watch ( `${SOURCE_DIR}/**/*`, ["deploy"] )
})

gulp.task ( "package", [ "clean", "bump", "build" ], ( callback ) => {
	let options = {
		"version": PACKAGE_VERSION
	}
	gulp.src (`${BUILD_DIR}/**/*`)
		.pipe ( magepack ( options ) )
		.pipe ( tar (`${PACKAGE_NAMESPACE}-${PACKAGE_VERSION}`) )
		.pipe ( gzip ({ extension: "tgz" }) )
		.pipe ( gulp.dest ( PACKAGE_DIR ) )
		.on ( "done", callback )
})
