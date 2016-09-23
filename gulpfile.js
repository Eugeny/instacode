const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const pug = require('gulp-pug');
const less = require('gulp-less');
const templateCache = require('gulp-angular-templatecache');


gulp.task('js', () => {
    return gulp.src([
        'static/app/*.js',
        'static/app/**/*.js',
    ])
        .pipe(babel({
            presets: ['es2015-script']
        }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('static/build'))
})

gulp.task('css', () => {
    return gulp.src([
        'static/bootstrap/bootstrap.less',
        'static/vendor/codemirror/lib/codemirror.css',
        'static/vendor/angular-ui-select/dist/select.css',
        'static/app/*.less',
        'static/app/**/*.less',
    ])
        .pipe(less())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('static/build'))
})

gulp.task('vendor-js', () => {
    return gulp.src([
        'static/vendor/angular/angular.js',
        'static/vendor/angular-route/angular-route.js',
        'static/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
        'static/vendor/codemirror/lib/codemirror.js',
        'static/vendor/angular-ui-codemirror/ui-codemirror.js',
        'static/vendor/angular-ui-select/dist/select.js',
    ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('static/build'))
})

gulp.task('template', () => {
    return gulp.src([
        'static/app/index.pug',
    ])
        .pipe(pug())
        .pipe(concat('index.html'))
        .pipe(gulp.dest('static/build'))
})


gulp.task('templates', () => {
    return gulp.src([
        'static/app/**/*.pug',
    ])
        .pipe(pug())
        .pipe(templateCache({standalone: true}))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('static/build'))
})

gulp.task('default', ['js', 'css', 'vendor-js', 'template', 'templates'])
gulp.task('watch', () => gulp.watch(['static/app/*', 'static/app/**/*', 'static/bootstrap/*'], ['js', 'css', 'vendor-js', 'template', 'templates']))
