const gulp = require('gulp');
const concat = require('gulp-concat');
const gulpSass = require('gulp-sass');
const terser = require('gulp-terser');
const fileinclude = require('gulp-file-include');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
const express = require('./app.js');

gulp.task('html', function (){
    return gulp.src('src/views/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/'));
    });

gulp.task('images', function (){
    return gulp.src('src/assets/images/*.*')
        .pipe(gulp.dest('dist/images'));
    });

gulp.task('data', function (){
    return gulp.src('src/assets/data/*.*')
        .pipe(gulp.dest('dist/data'));
    });

gulp.task('config', function (){
    return gulp.src('src/assets/config/**/*.js')
        // .pipe(concat('custom.js')) // 將多個js檔串成一個，打包起來輸出的檔案名稱
        .pipe(terser())  // uglify
        .pipe(gulp.dest('dist/config')); // 輸出路徑'
});


gulp.task("ts", function () {
    return tsProject.src().pipe(tsProject()).js
        .pipe(terser())  // uglify
        .pipe(gulp.dest('dist/javascripts')); // 輸出路徑'
});

gulp.task('js', function (){
    return gulp.src('src/assets/javascripts/**/*.js')
        // .pipe(concat('custom.js')) // 將多個js檔串成一個，打包起來輸出的檔案名稱
        .pipe(terser())  // uglify
        .pipe(gulp.dest('dist/javascripts')); // 輸出路徑'
});

gulp.task('js_package', function (){
    return gulp.src(['node_modules/lodash/lodash.js','node_modules/axios/dist/axios.js'])
        // .pipe(concat('custom.js')) // 將多個js檔串成一個，打包起來輸出的檔案名稱
        .pipe(terser())  // uglify
        .pipe(gulp.dest('dist/javascripts')); // 輸出路徑'
});

gulp.task('styles', function () {
    return gulp.src('src/assets/stylesheets/**/*.scss')    // 指定要處理的 Scss 檔案目錄
        .pipe(gulpSass({          // 編譯 Scss
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', function() {
    gulp.watch('src/views/**/*.html', gulp.series('html'));
    gulp.watch('src/assets/config/**/*.js', gulp.series('config'));
    gulp.watch('src/assets/javascripts/**/*.ts', gulp.series('ts'));
    gulp.watch('src/assets/javascripts/**/*.js', gulp.series('js'));
    gulp.watch('src/assets/stylesheets/**/*.scss', gulp.series('styles'));
    gulp.watch('src/assets/data/*', gulp.series('data'));
    gulp.watch('src/assets/images/**/*.*', gulp.series('images'));
});

// gulp 要做的 task 列表，gulp 會依照順序執行
gulp.task('default', gulp.series('html','images','data','config','js_package','ts','js','styles','watch'), function(){
    gulp.run('express');
});
