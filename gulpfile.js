// Variables

const projectFolder = 'dist';
const sourceFolder = 'src';

const path = {
    build:{
        html: `${projectFolder}/`,
        css: `${projectFolder}/styles/`,
        js: `${projectFolder}/scripts/`,
        img: `${projectFolder}/images/`,
        fonts: `${projectFolder}/fonts/`,
    },
    src:{
        html: `${sourceFolder}/index.html`,
        css: `${sourceFolder}/styles/index.css`,
        js: `${sourceFolder}/scripts/index.js`,
        img: `${sourceFolder}/images/**/*.{webp,jpg,png,svg,gif,ico}`,
        fonts: `${sourceFolder}/fonts/**/*.ttf`,
    },
    watch:{
        html: `${sourceFolder}/**/*.html`,
        css: `${sourceFolder}/styles/**/*.css`,
        js: `${sourceFolder}/scripts/**/*.js`,
        img: `${sourceFolder}/images/**/*.{webp,jpg,png,svg,gif,ico}`,
        fonts: `${sourceFolder}/fonts/**/*.ttf`,
    },
    clear: `./${projectFolder}/`
}


// Plugins

import gulp from 'gulp';
import sync from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import htmlhint from 'gulp-htmlhint';
import postcss from 'gulp-postcss';
import pimport from 'postcss-import';
import minmax from 'postcss-media-minmax';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import del from 'del';
import fileinclude from 'gulp-file-include';
import webpack from 'webpack-stream';
import sourcemaps from 'gulp-sourcemaps';
import imagesmin from 'gulp-imagemin';
import webp from 'gulp-webp';
import woff from 'gulp-ttf2woff';
import woff2 from 'gulp-ttf2woff2';

// Html

export const html = () => {
    return gulp.src(path.src.html)
    .pipe(fileinclude())
    .pipe(htmlhint())
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(sync.stream())
};

// Styles

export const styles = () => {
    return gulp.src(path.src.css)
    .pipe(sourcemaps.init())
    .pipe(postcss([
        pimport,
        minmax,
        autoprefixer,
        csso
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(sync.stream());
};

// Scripts

export const scripts = () => {
    return gulp.src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(webpack({
        output: {
            filename: 'index.js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: '/node_modules/'
                }
            ]
        }
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(sync.stream());
};

// Images

export const images = () => {
    return gulp.src(path.src.img)
    .pipe(webp({
        quality: 70
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(gulp.src(path.src.img))
    .pipe(imagesmin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 3,
        svgoPlugins: [
            {
                removeViewBox: false
            }
        ]
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(sync.stream());
}

// Fonts

export const fonts = () => {
    return gulp.src(path.src.fonts)
    .pipe(woff())
    .pipe(gulp.dest(path.build.fonts))
    .pipe(gulp.src(path.src.fonts))
    .pipe(woff2())
    .pipe(gulp.dest(path.build.fonts))
    .pipe(sync.stream());
}

// Server

export const server = () => {
    sync.init({
        server:{
            baseDir: path.clear
        },
        port: 3000,
        notify: false
    })
};

// Clean

export const clean = () => {
    return del(path.clear);
}

// Watch

export const watch = () => {
    gulp.watch(path.watch.html,gulp.series(html));
    gulp.watch(path.watch.css,gulp.series(styles));
    gulp.watch(path.watch.js,gulp.series(scripts));
    gulp.watch(path.watch.img,gulp.series(images));
    gulp.watch(path.watch.fonts,gulp.series(fonts));
};

// Default

export default gulp.series(
    clean,
    gulp.parallel(
        html,
        styles,
        scripts,
        images,
        fonts,
    ),
    gulp.parallel(
        watch,
        server,
    ),
);