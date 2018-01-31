const gulp = require('gulp');
const less = require('gulp-less');
const babel = require('gulp-babel');
const fs = require('fs');

gulp.task('deleteLib', () => {
  console.log('start cleaning lib dir');
  fs.rmdirSync('../lib');
});

gulp.task('handleJs', () => {
  console.log('start compiling js');
  gulp.src('../component/**/*.js')
    .pipe(babel({
      presets: ["env", "react", "stage-0"],
    }))
    .pipe(gulp.dest('../lib'));
});

gulp.task('handleLess', () => {
  console.log('start compiling less');
  gulp.src(['../component/**/*.less', '../component/**/*.css'])
    .pipe(less())
    .pipe(gulp.dest('../lib'));
});

gulp.task('default', ['handleJs', 'handleLess']);
