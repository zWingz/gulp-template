/* eslint-disable */
const gulp = require('gulp');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const useref = require('gulp-useref');
const filter = require('gulp-filter');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const gulpIf = require('gulp-if');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const htmlminify = require("gulp-html-minify");
const eslint = require('gulp-eslint');
const postcss = require('gulp-postcss');
const sourcemap = require("gulp-sourcemaps"); // sourcemaps
const concat = require('gulp-concat'); // 合并js文件
const babel = require('gulp-babel'); // 变异babel
const config = require('./config');
const sass = require('gulp-sass'); // sass
const path = require('path')

// var del = require('del');

// del('./dist');


/**
 * 创建sass编译任务
 * 
 * @param {Object} option = { taskName, src, dest, isIncremental = true, isConcat = false, concatName = 'concat.css' } 
 * @param {String} option.taskName 任务名称
 * @param {String} option.src 任务文件流
 * @param {String} option.dest 输出目录
 * @param {String} option.isConcat 是否将文件流合并到同一个文件,default: false
 * @param {String} option.concatName 合并名称, isConcat必须为true才生效
 */
function createSassTask({ taskName, src, isConcat = false, concatName = 'concat.css' }) {
    const dest = path.join(config.distDir, 'css')
    console.log(dest)
    gulp.task(taskName, function () {
        return gulp.src(src)
            .pipe(sourcemap.init())
            // css预处理任务都放在这里
            .pipe(sass({ outputStyle: 'compressed' }).on("error", sass.logError))
            .pipe(postcss())
            // css预处理结束
            // 增量更新操作
            .pipe(gulpIf(isConcat, concat(concatName)))
            .pipe(sourcemap.write('.'))
            .pipe(gulp.dest(dest))
    })
}


/**
 * 创建babel编译任务
 * 
 * @param {Object} option = { taskName, src, dest, isIncremental = true, isConcat = false, concatName = 'concat.css' } 
 * @param {String} option.taskName 任务名称
 * @param {String} option.src 任务文件流
 * @param {String} option.isIncremental 是否增量编译,default: true
 * @param {String} option.isConcat 是否将文件流合并到同一个文件,default: false
 * @param {String} option.concatName 合并名称, isConcat必须为true才生效
 */
function createBabelTask({ taskName, src, isConcat = false, concatName = 'concat.js' }) {
    const dest = path.join(config.distDir, 'js')
    console.log(src)
    gulp.task(taskName, function () {
        return gulp.src(src)
            .pipe(sourcemap.init())
            // js预处理放在下面
            .pipe(babel()) // 编译
            // js预处理结束
            .pipe(gulpIf(isConcat, concat(concatName)))
            .pipe(sourcemap.write('.'))
            .pipe(gulp.dest(dest))
    })
}
config.jsTask.forEach(each => {
    createBabelTask(each)
})
config.sassTask.forEach(each => {
    createSassTask(each)
})


// js文件
const esFile = 'src/js/*.js';
gulp.task('lint', function () {
    return gulp.src(esFile)
        .pipe(eslint())
        .pipe(eslint.format())
        // .pipe(eslint.failAfterError());
});

gulp.task('clean', ['lint'], function () {
    return gulp.src(['dist/**/*js', 'dist/**/*css', 'dist/**/*html'], { read: false })
        .pipe(clean());
})
gulp.task("index", ['clean'], function () {
    const jsFilter = filter("**/*.js", { restore: true });
    const esFilter = filter("**/*.es6", { restore: true });
    const cssFilter = filter("**/*.css", { restore: true });
    const scssFilter = filter("**/*.scss", { restore: true });
    const indexHtmlFilter = filter(['**/*', '!**/*.html'], { restore: true });
    const htmlFilter = filter(['**/*.html'], { restore: true });

    return gulp.src("../src/view/**/*.html")
        .pipe(useref({
            base: path.join(config.distDir)
        })) // Concatenate with gulp-userefpe(jsFilter)
        // 压缩Js
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore)
        // 合并压缩css
        .pipe(cssFilter)
        .pipe(csso()) // Minify any CSS sources
        .pipe(cssFilter.restore)
        // 压缩html
        .pipe(htmlFilter)
        .pipe(htmlminify())
        .pipe(htmlFilter.restore)
        // 版本标记
        .pipe(indexHtmlFilter)
        .pipe(rev()) // Rename the concatenated files (but not index.html)
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace()) // Substitute in new filenames
        .pipe(gulp.dest(path.join(config.distDir)));
});

// 图片压缩
gulp.task('img-min', () =>
    gulp.src('src/image/*')
    .pipe(imagemin([
        // imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        // imagemin.svgo({ plugins: [{ removeViewBox: true }] })
    ]))
    // .pipe(imagemin())
    .pipe(gulp.dest('dist/image'))
);

gulp.task('default', function () {
    gulp.start(...[config.jsTask.concat(config.sassTask).map(each => each.taskName), 'index', 'img-min']);
});
