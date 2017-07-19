const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const watchify = require('watchify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const autoprefixer = require('autoprefixer');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const isProduction = process.env.NODE_ENV === 'production';

const AUTOPREFIXER_BROWSERS = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 2.3',
  'bb >= 10',
];

const paths = {
  dist: {
    base: 'lib/public',
    js: 'lib/public/js',
    css: 'lib/public/css',
    i: 'lib/public/i',
    fonts: 'lib/public/fonts',
  },
};

// JavaScript 格式校验
gulp.task('eslint', () => gulp.src('src/web/js/**/*.js')
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint())
    .pipe($.eslint.format())
  // .pipe($.eslint.failOnError());
);

// 图片优化
gulp.task('images', () => gulp.src('src/web/i/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest(paths.dist.i))
    .pipe($.size({ title: 'images' })));

// 拷贝相关资源
gulp.task('copy', () => gulp.src([
  'src/web/*',
  '!src/web/*.html',
  '!src/web/js',
  '!src/web/less',
  '!src/web/i',
  'node_modules/amazeui/dist/css/amazeui.min.css',
  'node_modules/amazeui/dist/fonts/*',
  'node_modules/raven-js/dist/raven.min.js',
], {
  dot: true,
}).pipe(gulp.dest((file) => {
  const filePath = file.path.toLowerCase();
  if (filePath.indexOf('.js') > -1) {
    return paths.dist.js;
  }
  if (filePath.indexOf('.css') > -1) {
    return paths.dist.css;
  }
  if (filePath.indexOf('fontawesome') > -1) {
    return paths.dist.fonts;
  }
  return paths.dist.base;
}))
    .pipe($.size({ title: 'copy' })));

// 编译 Less，添加浏览器前缀
gulp.task('styles', () => gulp.src(['src/web/less/app.less'])
    .pipe($.less())
    .pipe($.postcss([autoprefixer({ browsers: AUTOPREFIXER_BROWSERS })]))
    .pipe(gulp.dest('lib/public/css'))
    .pipe($.csso())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest('lib/public/css'))
    .pipe($.size({ title: 'styles' })));

// 打包 Common JS 模块
let b = browserify({
  cache: {},
  packageCache: {},
  entries: ['./src/web/js/app.js'],
  debug: !isProduction,
  transform: ['babelify'],
});

if (!isProduction) {
  b = watchify(b);
}

// 如果不想把 React 打包进去，可以把下面一行注释去掉
// b.transform('browserify-shim', {global: true});

const bundle = function () {
  const s = (
    b.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest(paths.dist.js))
      .pipe($.size({ title: 'script' }))
  );

  return !isProduction ? s : s.pipe($.uglify())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe($.size({
      title: 'script minify',
    }));
};

gulp.task('browserify', () => {
  if (!isProduction) {
    b.on('update', bundle).on('log', $.util.log);
  }

  return bundle();
});

// 压缩 HTML
gulp.task('html', () => gulp.src('src/web/*.html')
    .pipe($.minifyHtml())
    .pipe($.replace(/\{\{__VERSION__\}\}/g, isProduction ? '.min' : ''))
    .pipe(gulp.dest('lib/public'))
    .pipe($.size({ title: 'html' })));

// 洗刷刷
gulp.task('clean', () => del(['public/*', '!public/.git'], { dot: true }));

// 构建任务
gulp.task('build', (cb) => {
  runSequence('clean', ['styles', 'eslint', 'html', 'images', 'copy', 'browserify'], cb);
});

// 监视源文件变化自动cd编译
gulp.task('watch', () => {
  gulp.watch('src/web/*.html', ['html']);
  gulp.watch('src/web/less/*.less', ['styles']);
  gulp.watch('src/web/i/*', ['images']);
  gulp.watch('src/web/*.js', ['eslint']);
});

// 默认任务
// 启动预览服务，并监视 Dist 目录变化自动刷新浏览器
gulp.task('default', ['build', 'watch'], () => {
  browserSync({
    notify: false,
    logPrefix: 'ASK',
    server: 'public',
  });

  gulp.watch(['public/*'], reload);
});
