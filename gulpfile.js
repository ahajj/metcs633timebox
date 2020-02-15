var gulp = require('gulp');
var ui5preload = require('gulp-ui5-preload');
var uglify = require('gulp-uglify');
var prettydata = require('gulp-pretty-data');
var gulpif = require('gulp-if');

gulp.task('ui5preload', function () {
    return gulp.src([
        'webapp/**/**.+(js|xml)',
        '!src/ui/thirdparty/**'
    ])
        //.pipe(gulpif('**/*.js', uglify()))    //only pass .js files to uglify
        .pipe(gulpif('**/*.xml', prettydata({ type: 'minify' }))) // only pass .xml to prettydata 
        .pipe(ui5preload({ base: 'webapp', namespace: 'timebox' }))
        .pipe(gulp.dest('webapp'));
})