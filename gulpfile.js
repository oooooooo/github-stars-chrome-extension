'use strict';

var gulp    = require('gulp'),
    del     = require('del'),
    espower = require('gulp-espower'),
    plumber = require('gulp-plumber'),
    mocha   = require('gulp-mocha');

gulp.task('test', function() {
  del('dest');
  gulp.src('./test/*.js')
    .pipe(plumber())
    .pipe(espower())
    .pipe(gulp.dest('dest'))
    .on('finish', function() {
      gulp.src('./dest/*.js')
        .pipe(plumber())
        .pipe(mocha({reporter: 'nyan'}));
  });
});

gulp.task('watch', function() {
  gulp.watch(['js/*.js', 'test/*.js'], ['test']);
});

gulp.task('default', ['watch']);
