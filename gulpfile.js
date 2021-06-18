const gulp = require('gulp');
const bSync = require('browser-sync').create();
const rollup = require("rollup");
const ts = require("gulp-typescript");
const tsProject = ts.createProject('tsconfig.json');


gulp.task('bSync', function () {
    bSync.init({
        server: {
            baseDir: "./examples",
            directory: true,
        },
        //host: process.env.BSYNC_HOST || undefined,
        //proxy: "192.168.0.13",
        //proxy: "b-sync",
        port: 3030,

    });
});

/* =====================================================================================
 WATCH
 ======================================================================================*/


gulp.task('watch', () => {
    gulp.watch('./src/**/*.ts', gulp.series(["ts", 'esm', "umd"]));

});


/* =====================================================================================
    MAIN
======================================================================================*/
gulp.task('default', gulp.parallel(['bSync', 'watch']));


gulp.task('ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('ts_out'));
});

/* =====================================================================================
 ROLLUP
 ======================================================================================*/



const outputEsm = {
    // format: "umd", // required
    format: "esm", // required
    file: "./examples/libs/glide.esm.js",
    name: "glide", // exposed name of the lib.
    exports: "named",
    globals: "window"
};

const outputUmd = {
    format: "umd", // required
    file: "./examples/libs/glide.js",
    name: "glide", // exposed name of the lib.
    //exports: "named",
    globals: "window"
};




gulp.task('esm', () => {

    return new Promise(async (resolve) => {
        const bundle = await rollup.rollup({input: "./ts_out/glide.js"})
            .catch((err) => {
                console.log(err)
            });

        if (bundle) await bundle.write(outputEsm);
        bSync.reload({stream: false});
        resolve();
    });

});

const fs = require("fs");

gulp.task('umd', () => {

    return new Promise(async (resolve) => {

        const bundle = await rollup.rollup({input: "./ts_out/glide.js"})
            .catch((err) => {
                console.log(err)
            });

        if (bundle) await bundle.write(outputUmd);

        /*
            TESTING !!!!
         */
        fs.copyFile("./examples/libs/glide.js", ".././glide-old/speedtest/glide.js", (er)=> console.log(er));

        bSync.reload({stream: false});
        resolve();
    });

});


/* =====================================================================================
 CLEARS CONSOLE WINDOW
 ======================================================================================*/
function clear() {
    process.stdout.write("\u001b[2J\u001b[0;0H");
}
