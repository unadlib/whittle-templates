var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    stylus = require('gulp-stylus'),
    <% if (data.bootstrap) { %>
    bootstrap = require('bootstrap-styl'),
    <% } %>
    nib = require('nib'),
    del = require('del'),
    connect = require('gulp-connect'),
    pug = require('gulp-pug'),
    <% if (data.php) { %>
    pug2php = require('gulp-jade2php'),
    <% } %>
    rename = require("gulp-rename"),
    paths = {
        watch:{
            scripts: ['src/js/**/*.js', '!src/external/!**!/!*.js'],
            images: 'src/img',
            css:['src/css/**/*.styl'],
            html:['src/*.jade','src/html/**/*.jade']
        },
        scripts: ['src/js/**/*.js', '!src/external/!**!/!*.js'],
        images: 'src/img/!**/!*',
        css:['src/css/*.styl'],
        html:['src/*.jade','src/html/**/*.jade'],
        copy:{
            fonts:[<% if (data.fontawesome) { %>'node_modules/font-awesome/fonts/*'<% } %>],
            css:[<% if (data.fontawesome) { %>'node_modules/font-awesome/css/font-awesome.min.css'<% } %>],
            js:[
                'src/js/external/*'
            ],
            img:['src/img/*']
        },
        js:{
            polyfill:[
                <% if (data.ie8) { %>
                "node_modules/Respond.js/dest/respond.min.js",
                "node_modules/html5shiv/dist/html5shiv.min.js"
                <% } %>
            ],
            es5:[
                <% if (data.ie8) { %>
                "node_modules/es5-shim/es5-shim.min.js",
                "node_modules/es5-shim/es5-sham.min.js"
                <% } %>
            ],
            library:[
                <% if (data.bootstrap) { %>
                "node_modules/jquery/jquery.min.js",
                "node_modules/bootstrap/dist/js/bootstrap.min.js"
                <% } %>
            ]
        }
    },
    //the page's pageData
    pageData = require('./data'),
    uglifyOption = {
        <% if (data.ie8) { %>
        compress: { screw_ie8: false },
        mangle: { screw_ie8: false },
        output: { screw_ie8: false }
        <% } %>
    };

gulp.task('connect', function() {
    connect.server({
        root: 'build',
        livereload: true
    });
});

gulp.task('copy:fonts', function () {
    return gulp
        .src(paths.copy.fonts)
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('copy:css', function () {
    return gulp
        .src(paths.copy.css)
        .pipe(gulp.dest('build/css'));
});

gulp.task('copy:js', function () {
    return gulp
        .src(paths.copy.js)
        .pipe(gulp.dest('build/js/external'));
});

gulp.task('copy:img', function () {
    return gulp
        .src(paths.copy.img)
        .pipe(gulp.dest('build/img'));
});

gulp.task('clean:html', function () {
    return del(['build/*.html']);
});

gulp.task('clean:js', function () {
    return del(['build/js/*.js']);
});

gulp.task('clean:css', function () {
    return del(['build/css/*.css']);
});

gulp.task('clean:image', function () {
    // return del(['build/img/**']);
});

<% if (data.ie8) { %>
gulp.task('js.polyfill', function () {
    return gulp.src(paths.js.polyfill)
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOption))
        .pipe(concat('polyfill.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('js.es5', function () {
    return gulp.src(paths.js.es5)
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOption))
        .pipe(concat('es5.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
    // .pipe(connect.reload());
});
<% } %>

gulp.task('js.library', function () {
    return gulp.src(paths.js.library)
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOption))
        .pipe(concat('library.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('scripts',[<% if (data.ie8) { %>'js.polyfill','js.es5',<% } %>'js.library'],function () {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOption))
        .pipe(concat('common.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js/module/'))
        .pipe(connect.reload());
});

gulp.task('images',function () {
    return gulp.src(paths.images)
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('build/img'))
        .pipe(connect.reload());
});

gulp.task('stylus', function () {
    return gulp.src('src/css/*.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({
            use: [nib()<% if (data.bootstrap) { %>,bootstrap()<% } %>],
            compress: true,
            linenos: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'))
        .pipe(connect.reload());
});


gulp.task('watch', function () {
    var watch = paths.watch;
    gulp.watch(watch.scripts, ['scripts']);
    gulp.watch(watch.images, ['images']);
    gulp.watch(watch.css, ['stylus']);
    gulp.watch(watch.html, ['pug']);
});

<% if (data.php) { %>
gulp.task('pug2php', function () {
    return gulp.src('src/*.jade')
        .pipe(pug2php({
            omitPhpRuntime: true,
            omitPhpExtractor: true
        }))
        .pipe(rename({
            extname: ".php"
        }))
        .pipe(gulp.dest("build/"));
});
<% } %>

gulp.task('pug', function () {
    return gulp.src(['src/*.jade','src/html/**/*.jade'])
        .pipe(pug({
            data: pageData,
            pretty: true
        }))
        .pipe(gulp.dest("build/"))
        .pipe(connect.reload());
});

gulp.task('clean', ['clean:html','clean:image','clean:css','clean:js']);
gulp.task('default', ['clean','connect', 'watch', 'pug', 'scripts', 'stylus', 'copy:fonts','copy:css', 'copy:js', 'copy:img']);
gulp.task('build', ['pug', 'scripts', 'stylus', 'copy:fonts','copy:css', 'copy:js', 'copy:img']);
<% if (data.php) { %>
gulp.task('php', ['pug2php', 'build']);
<% } %>
