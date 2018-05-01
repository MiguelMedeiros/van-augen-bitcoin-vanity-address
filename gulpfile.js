var   gulp           = require('gulp'),
      concat         = require('gulp-concat'),
      uglify         = require('gulp-uglify'),
      rename         = require('gulp-rename'),
      sass           = require('gulp-sass'),
      livereload     = require('gulp-livereload');

var   config = {
      scripts: [
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/popper.js/dist/umd/popper.min.js',
            './node_modules/bootstrap/dist/js/bootstrap.min.js',
            './public/javascripts/vendor/clipboard.min.js',
            './public/javascripts/vendor/qrcode.min.js',
            './public/javascripts/vendor/jquery.mask.min.js',
            './public/javascripts/vendor/jquery.counter.js',
            './public/javascripts/app/**/*.js'
      ],
      styles:[
            './public/stylesheets/partials/**/*.scss',
            './public/stylesheets/style.scss'
      ]
};

gulp.task('scripts', function() {
      return gulp.src(config.scripts)
            .pipe(concat('scripts.js'))
            .pipe(gulp.dest('./public/javascripts/'))
            .pipe(uglify())
            .pipe(rename({ extname: '.min.js' }))
            .pipe(gulp.dest('./public/javascripts/'))
            .pipe(livereload());
});

gulp.task('sass', function () {
      return gulp.src(config.styles)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./public/stylesheets'))
            .pipe(livereload());
});

gulp.task('watch', function () {
      livereload.listen(35729);
      gulp.watch('**/*.php').on('change', function(file) {
            livereload.changed(file.path);
      });
      gulp.watch('./public/stylesheets/**/*.scss', ['sass']);
      gulp.watch('./public/javascripts/app/**/*.js', ['scripts']);
      gulp.watch('./public/javascripts/app/**/*.js').on('change', function(file) {
            livereload.changed(file.path);
      });
      gulp.watch('./routes/**/*.js').on('change', function(file) {
            livereload.changed(file.path);
      });
      gulp.watch('./**/*.ejs').on('change', function(file) {
            livereload.changed(file.path);
      });
      gulp.watch('./app.js').on('change', function(file) {
            livereload.changed(file.path);
      });
});

gulp.task('default', ['sass', 'scripts', 'watch']);