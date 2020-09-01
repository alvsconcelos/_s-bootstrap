// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var postcss = require('gulp-postcss');
var watch = require('gulp-watch');
var touch = require('gulp-touch-fd');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('autoprefixer');

// Configuration file to keep your code DRY
var cfg = require('./gulpconfig.json');
var paths = cfg.paths;

gulp.task('sass', function () {
	var stream = gulp
		.src(paths.sass + '/*.scss')
		.pipe(
			plumber({
				errorHandler: function (err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sass({ errLogToConsole: true }))
		.pipe(postcss([autoprefixer()]))
		.pipe(sourcemaps.write(undefined, { sourceRoot: null }))
		.pipe(gulp.dest(paths.css))
		.pipe(touch());
	return stream;
});

gulp.task('watch', function () {
	gulp.watch([`${paths.sass}/**/*.scss`, `${paths.sass}/*.scss`], gulp.series('styles'));
	gulp.watch(
		[
			`${paths.dev}/js/**/*.js`,
			'js/**/*.js',
			'!js/theme.js',
			'!js/theme.min.js'
		],
		gulp.series('scripts')
	);
});

gulp.task('minifycss', function () {

	return gulp
		.src([
			`${paths.css}/theme.css`,
		])
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(cleanCSS({
			compatibility: '*',
			level: {1: {specialComments: 0}}
		}))
		.pipe(
			plumber({
				errorHandler: function (err) {
					console.log(err);
					this.emit('end');
				}
			})
		)
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.css))
		.pipe(touch());
});

gulp.task('cleancss', function () {
	return gulp
		.src(`${paths.css}/*.min.css`, { read: false })
		.pipe(ignore('theme.css'))
		.pipe(rimraf());
});

gulp.task('styles', function (callback) {
	gulp.series('sass', 'minifycss')(callback);
});


gulp.task('scripts', function () {
	var scripts = [
		// Adds bootstrap components
		`${paths.dev}/js/bootstrap.native/dist/bootstrap-native.js`,

		`${paths.dev}/js/custom-javascript.js`
	];
	gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel(
			{
			presets: ['@babel/preset-env']
			}
		))
		.pipe(concat('theme.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js));

	return gulp
		.src(scripts, { allowEmpty: true })
		.pipe(babel())
		.pipe(concat('theme.js'))
		.pipe(gulp.dest(paths.js));
});

gulp.task('default', gulp.series('watch'));