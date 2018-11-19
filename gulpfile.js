const gulp = require('gulp4');
const argv = require('yargs').argv;
const typescript = require('gulp-typescript');
const minify = require('gulp-uglify');
const pug = require('gulp-pug');
const gulpif = require('gulp-if');
const minifyHTML = require('gulp-minify-html');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const prod = (argv.prod === true);

const server = ()=>{
  return gulp.src('src/*.ts')
      .pipe(gulpif(!prod, sourcemaps.init()))
      .pipe(typescript())
      .pipe(gulpif(prod, minify()))
      .pipe(gulpif(!prod, sourcemaps.mapSources((sourcePath, file)=>{
          return '../src/' + sourcePath
      })))
      .pipe(gulpif(!prod, sourcemaps.write('maps')))
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

const bower = ()=>{
    return gulp.src(['bower_components/**/*.css'])
        .pipe(gulp.dest('dist/lib/'));
};

gulp.task('clean', function () {
    return del('dist/**', {force: true});
});
gulp.task('build', gulp.parallel(server, views, bower));
gulp.task('default', gulp.series("clean", "build"));