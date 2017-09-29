// sass文件
const sassFile = '../src/sass/*.scss';
// js文件
const esFile = '../src/js/*.js';
const path = require('path')
    // sass以及js文件编译后临时存放目录,即在html引用的目录
const sassRelease = '../tmpRelease/css';
const esRelease = '../tmpRelease/js';
module.exports = {
    jsTask: [{
        taskName: 'sass',
        src: esFile,
        // dest: sassRelease,
        // isConcat: true,
        // concatName: 'test.css'
    }],
    sassTask: [{
        taskName: 'babel',
        src: sassFile,
        // dest: esRelease,
    }],
    tempDir: path.resolve(__dirname, '../tmpRelease'),
    distDir: path.resolve(__dirname, '../dist'),
    browserSyncRoot: '../tmpRelease',
}
