'use strict';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import concat from 'gulp-concat';

gulp.task('es6', () =>
    gulp.src(['src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        //.pipe(concat('node-buzzer.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('es5'))
);

gulp.task('examples', () =>
    gulp.src(['examples/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('es5/examples'))
);


gulp.task('watch', () => {
    gulp.watch(['./index.js', 'src/**/*.js'], ['es6']);
    gulp.watch([ 'examples/*.js'], ['examples']);
});

gulp.task('default', ['es6', 'examples', 'watch']);