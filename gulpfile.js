const gulp = require('gulp4');
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const typescript = require('gulp-typescript');
const pug = require('gulp-pug');
const less = require('gulp-less');
const minify = require('gulp-uglify');
const minifyHTML = require('gulp-minify-html');
const minifyCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const prod = (argv.prod === true);

const ts = ()=>{
  return gulp.src('src/**/*.ts')
      .pipe(gulpif(!prod, sourcemaps.init()))
      .pipe(typescript())
      .pipe(gulpif(prod, minify()))
      .pipe(gulpif(!prod, sourcemaps.mapSources((sourcePath, file)=>{
          return '../src/' + sourcePath
      })))
      .pipe(gulpif(!prod, sourcemaps.write(/*'maps'*/)))
      .pipe(gulp.dest('dist/'));
};

const views = ()=>{
    return gulp.src('src/views/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(rename({
            dirname: 'html',
        }))
        .pipe(gulpif(prod, minifyHTML()))
        .pipe(gulp.dest('dist/'));
};

const styles = ()=>{
    return gulp.src('src/styles/*.less')
        .pipe(gulpif(!prod, sourcemaps.init()))
        .pipe(less())
        .pipe(gulpif(prod, minifyCSS()))
        .pipe(gulpif(!prod, sourcemaps.mapSources((sourcePath, file)=>{
            return '../src/styles/' + sourcePath
        })))
        .pipe(gulpif(!prod, sourcemaps.write(/*'maps'*/)))
        .pipe(gulp.dest('dist/styles/'))
};

const bower = ()=>{
    return gulp.src(['bower_components/**/*.css'])
        .pipe(gulp.dest('dist/lib/'));
};

gulp.task('clean', function () {
    return del('dist/**', {force: true});
});

gulp.task('build', gulp.parallel(ts, views, bower, styles));
gulp.task('default', gulp.series("clean", "build"));