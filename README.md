# Gulp模板
### 包含功能:
开发:
+ babel编译
+ sass编译
+ eslint检查
+ browserSync

生产:
+ js合并
+ css合并
+ eslint检查
+ 图片压缩
+ 版本控制


### 流程介绍:
在开发当中将es6以及sass文件编译成浏览器可识别的js以及css文件,并保存在临时目录 `tmpRelease` 中,在index.html引用临时目录的文件.
```html
    <link rel="stylesheet" href="./tmpRelease/css/global.css">
    <link rel="stylesheet" href="./tmpRelease/css/csa.css">
    <script src='./tmpRelease/js/index.js'></script>
    <script src='./tmpRelease/js/test.js'></script>
```
由于开发当中使用的是增量编译,所以对于eslint只会对修改过得文件生效.

但会在第一次启动gulp进行全局eslint检查,后续只会对增量的文件进行检查.

eslint规则目前只提供样例,最终应按照其他小组所规定的规则

对于browserSync,目前对于css/sass文件修改可通过注入刷新,但对于js和html修改只能全局刷新.

---
通过调用`createSassTask` 和 `createBabelTask` 生成任务
```javascript
// 创建sass预处理任务
createSassTask({
    taskName: 'sass',
    src: sassFile,
    dest: sassRelease
        // isConcat: true,
        // concatName: 'test.css'
});
// 创建js预处理任务
createBabelTask({
    taskName: 'babel',
    src: esFile,
    dest: esRelease
});
```
