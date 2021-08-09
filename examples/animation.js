import glide from "./libs/glide.esm.js";

let img, res, stage, canvas, ctx, rect, n, dur;
let arr = [];
let els;

const bg = '#04e7ff';

const cr = 255;
const cg = 0;
const cb = 255;


const funcs = [explode, rotate, scale, explode2, melt];
let index = 0;
let timeout;


export async function init() {
    // img = document.querySelector(".src-img");
    stage = document.querySelector(".stage");
    stage.classList.add("animate");
    res = document.createElement("div");
    res.classList.add("animation_res");
    canvas = document.createElement('canvas');
    ctx = canvas.getContext("2d");

    await loadImg();

    img.classList.add("animation_img");
    stage.appendChild(img);

    rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    stage.removeChild(img);
    // stage.appendChild(canvas);
    stage.appendChild(res);

    window.clearTimeout(timeout);
    dur = 0;

    // parseCtx();
    // setElements();

    // explode();
    // explode2();
    // melt();
    // rotate();
    // scale();

    run();

}

export function stop() {
    window.clearTimeout(timeout);
}

function run() {
    timeout = setTimeout(() => {
        parseCtx();
        setElements();
        dur = 0;
        funcs[index]();
        index++;
        if (index > funcs.length - 1) index = 0;
        run();
    }, dur);
}


function loadImg() {
    return new Promise((resolve => {
        img = document.createElement("img");
        img.onload = () => {
            resolve();
        };
        img.src = "./assets/glide.png";
    }))

}


function parseCtx() {
    const step = 3;
    arr = [];
    n = 0;
    for (let i = 0; i < canvas.width; i += step) {
        for (let j = 0; j < canvas.height; j += step) {
            const px = ctx.getImageData(i, j, 1, 1).data[3];
            if (px > 0) {
                arr.push({x: i, y: j});
                n++;
            }
        }
    }
    console.log(n);

}

function setElements() {

    let str = "";

    for (let i = 0; i < arr.length; i++) {
        str += `<div class="el2" style="transform: translate(${arr[i].x}px, ${arr[i].y}px)"></div>`;
    }
    res.innerHTML = str;
    els = document.querySelectorAll(".el2");
}


function getRandColor() {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function explode() {

    for (let i = 0; i < n; i++) {
        let del = 100 + Math.random() * 100 + i * 2;
        let time = 1000 + Math.random() * 1000;
        const obj = arr[i];
        let x = obj.x + Math.random() * rect.width / 2 - Math.random() * rect.width / 2;
        let y = obj.y + Math.random() * rect.height - Math.random() * rect.height;
        // let rot = Math.random() * 180 - Math.random() * 180;

        let rgb = getRandColor();
        let sc = Math.random() * 3;
        let scStr = `${sc}, ${sc}`;

        const a = glide.to(els[i], time,
            {x: x, y: {value: y, duration: time + 500}, scale: scStr, bg: rgb},
            {delay: del, repeat: 1, ease: 'quadInOut'})
            .to(500, {y: "+=10"});

        if (dur < a.totalDuration) dur = a.totalDuration;

    }
}


function explode2() {

    // glide.to(res, 2000, {rotateY:45}, {delay:1000, repeat:1})

    for (let i = 0; i < n; i++) {
        // let del = 500 + Math.random() * 100 + i * 4;
        let del = arr[i].y * 15;
        let time = 1000 + Math.random() * 1000;
        const obj = arr[i];
        let x = obj.x + Math.random() * rect.width / 5 - Math.random() * rect.width / 5;
        let y = obj.y + Math.random() * rect.height / 2 - Math.random() * rect.height;


        const a = glide.to(els[i], time, {
                x: x,
                y: {value: y, duration: time + 500},
                opacity: .6,
                bg: {value: '#047dff', time: time / 2}
            },
            {delay: del, repeat: 1});
        // .to(time, {x:'*=1.3', y: "+=30", bg: '#047dff'});

        if (dur < a.totalDuration) dur = a.totalDuration;


        // glide.to(els[i], time, {x: x, y: {value:y, duration: time + 500}, opacity:0}, {delay: del, repeat: 1})

    }
}


function melt() {

    for (let i = 0; i < n; i++) {
        const obj = arr[i];
        let del = n * 2 - arr[i].y * 15 + Math.random() * 300 + 100;
        let x = obj.x + Math.random() * rect.width / 5 - Math.random() * rect.width / 5;
        const a = glide.to(els[i], 700,
            {y: "150", bg: '#ff07fe'},
            {repeat: 0, delay: del})
            .to(800, {x: x})
            .to(500, {x: obj.x, y: obj.y, bg: bg});
        // .to(800, {x:-obj.x + 250,
        //     y:-obj.y + 100})

        if (dur < a.totalDuration) dur = a.totalDuration;

    }
}

function rotate() {

    for (let i = 0; i < n; i++) {
        const obj = arr[i];
        let del = arr[i].y * 6 + Math.random() * 30;
        let rot = 360;// + Math.random() * 180;
        let x = Math.random() * 40 - Math.random() * 40;
        let y = Math.random() * 10 - Math.random() * 10;
        let trOr = `${x}px ${y}px`;
        els[i].style.transformOrigin = trOr;
        const a = glide.to(els[i], 3500,
            {rotate: rot, bg: '#ff07fe'},
            {repeat: 0, delay: del})
            .to(1000, {bg: bg}, {delay: Math.random() * 100, ease: 'elasticOut'});
        // .to(500, {x: obj.x, y: obj.y, bg: '#00ee00'});
        // .to(800, {x:-obj.x + 250,
        //     y:-obj.y + 100})

        if (dur < a.totalDuration) dur = a.totalDuration;

    }
}


function scale() {


    glide.to(stage, 1500, {perspective:250}, {delay:100, repeat:1});
    glide.to(res, 2000, {rotateY:-60}, {delay:100, repeat:1});

    for (let i = 0; i < n; i++) {
        const obj = arr[i];
        let del = arr[i].y * 12 + Math.random() * 30 + 200;
        let sc = Math.random() * 60 + 3.2;
        let rand = Math.random() * 10000 - Math.random() * 100;
        const a = glide.to(els[i], 1500,
            {scale: `${sc}, ${.1}`, bg: '#ff07fe'},
            {repeat: 1, delay: del})
            .to(1000, {scaleX: '.2', scaleY: 1, bg: bg}, {})
            .to(1000, {n:100});
        // .to(500, {x: obj.x, y: obj.y, bg: '#00ee00'});
        // .to(800, {x:-obj.x + 250,
        //     y:-obj.y + 100})

        if (dur < a.totalDuration) dur = a.totalDuration;

    }
}

