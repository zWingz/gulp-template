/* eslint-disable */
const gulp = require('gulp');
const sass = require('gulp-sass'); // sass
const autoprefixer = require('gulp-autoprefixer'); // 自动补全
const babel = require('gulp-babel'); // 变异babel
const browserSync = require('browser-sync').create();
const filter = require('gulp-filter'); // 过滤器
const sourcemap = require("gulp-sourcemaps"); // sourcemaps
const concat = require('gulp-concat'); // 合并js文件
const plumber = require('gulp-plumber'); // 异常后继续
const notify = require('gulp-notify'); // 通知.可不用
// scss文件编译后存放目录,即在html引用的目录
const changed = require('gulp-changed') // 一对一增量编译
const cached = require('gulp-cached') // 一对多增量编译
const remember = require('gulp-remember') // 一对多增量编译
const eslint = require('gulp-eslint');
// 用于判断
const gulpIf = require('gulp-if'); // 判断逻辑
const reload = browserSync.reload;
const config = require('./config');
const path = require('path')
const postcss = require('gulp-postcss');

// sass以及js文件编译后临时存放目录,即在html引用的目录

/**
 * 创建sass编译任务
 * 
 * @param {Object} option = { taskName, src, dest, isIncremental = true, isConcat = false, concatName = 'concat.css' } 
 * @param {String} option.taskName 任务名称
 * @param {String} option.src 任务文件流
 * @param {String} option.dest 输出目录
 * @param {String} option.isIncremental 是否增量编译,default: true
 * @param {String} option.isConcat 是否将文件流合并到同一个文件,default: false
 * @param {String} option.concatName 合并名称, isConcat必须为true才生效
 */
function createSassTask({ taskName, src, isIncremental = true, isConcat = false, concatName = 'concat.css' }) {
    const dest = path.join(config.tempDir, 'css')
    gulp.task(taskName, function () {
        return gulp.src(src)
            .pipe(plumber()) // 保证错误不会打断gulp进程
            .pipe(sourcemap.init())
            .pipe(gulpIf(isIncremental && !isConcat, changed(dest, { // dest 参数需要和 gulp.dest 中的参数保持一致
                extension: '.css' // 如果源文件和生成文件的后缀不同，这一行不能忘
            })))
            .pipe(gulpIf(isIncremental && isConcat, cached(taskName)))
            // css预处理任务都放在这里
            .pipe(sass({ outputStyle: 'compressed' }).on("error", sass.logError))
            .pipe(postcss())
            // css预处理结束
            // 增量更新操作
            .pipe(gulpIf(isIncremental && isConcat, remember(taskName))) // 和 cached() 参数一致
            .pipe(gulpIf(isIncremental && isConcat, concat(concatName)))
            .pipe(sourcemap.write('.'))
            .pipe(gulp.dest(dest))
            .pipe(filter('**/*.css')) // Filtering stream to only css files
            .pipe(browserSync.reload({ stream: true }));
    })
    gulp.watch([src], [taskName]);

}


/**
 * 创建babel变异任务
 * 
 * @param {Object} option = { taskName, src, dest, isIncremental = true, isConcat = false, concatName = 'concat.css' } 
 * @param {String} option.taskName 任务名称
 * @param {String} option.src 任务文件流
 * @param {String} option.isIncremental 是否增量编译,default: true
 * @param {String} option.isConcat 是否将文件流合并到同一个文件,default: false
 * @param {String} option.concatName 合并名称, isConcat必须为true才生效
 */
function createBabelTask({ taskName, src, isIncremental = true, isConcat = false, concatName = 'concat.js' }) {
    const dest = path.join(config.tempDir, 'js')
    gulp.task(taskName, function () {
        return gulp.src(src)
            .pipe(plumber())
            .pipe(gulpIf(isIncremental && !isConcat, changed(dest, { // dest 参数需要和 gulp.dest 中的参数保持一致
                extension: '.js' // 如果源文件和生成文件的后缀不同，这一行不能忘
            })))
            .pipe(gulpIf(isIncremental && isConcat, cached(taskName)))
            .pipe(eslint()) // 执行eslint检查
            .pipe(eslint.format())
            .pipe(sourcemap.init())
            // js预处理放在下面
            .pipe(babel()) // 变异
            // js预处理结束
            .pipe(gulpIf(isIncremental && isConcat, remember(taskName))) // 和 cached() 参数一致
            .pipe(gulpIf(isIncremental && isConcat, concat(concatName)))
            .pipe(sourcemap.write('.'))
            .pipe(gulp.dest(dest))
            .pipe(filter('**/*.js')) // Filtering stream to only css files
            .pipe(browserSync.reload({ stream: true }));
    })
    gulp.watch([src], [taskName]);
}

const htmlSrc = '../src/view/**/*.html'
gulp.task('html', function () {
    return gulp.src(htmlSrc)
        // .pipe(plumber())
        .pipe(changed(path.join(config.tempDir, 'view')))
        .pipe(gulp.dest(path.join(config.tempDir, 'view')))
        .pipe(filter('**/*.html')) // Filtering stream to only css files
        .pipe(browserSync.reload({ stream: true }));
})

const imgSrc = '../src/image/*.jpg'
gulp.task('image', function () {
    return gulp.src(imgSrc)
        // .pipe(plumber())
        .pipe(changed(path.join(config.tempDir, 'image')))
        .pipe(gulp.dest(path.join(config.tempDir, 'image')))
        // .pipe(filter('**/*.js')) // Filtering stream to only css files
        .pipe(browserSync.reload());
})


config.jsTask.forEach(each => {
    createBabelTask(each)
})
config.sassTask.forEach(each => {
    createSassTask(each)
})

// 执行eslint检查
gulp.task('lint', function () {
    return gulp.src('../src/js/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
});
const taskNames = config.jsTask.concat(config.sassTask).map(each => each.taskName);
// 浏览器同步任务
// http://www.browsersync.cn/docs/gulp/
gulp.task('browser-sync', taskNames, function () {
    // 设置代理
    // browserSync.init({ proxy: "" });
    browserSync.init({
            server: {
                baseDir: config.browserSyncRoot,
                // proxy: "yourlocal.dev"
            }
        })
        // gulp.watch(["../src/**/*.html"], reload);
});

gulp.task('default', function () {
    gulp.start(['html', 'lint', 'browser-sync']);
    gulp.watch([imgSrc], ['image']);
    gulp.watch([htmlSrc], ['html']);

});
