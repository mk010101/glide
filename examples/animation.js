import glide from "./libs/glide.esm.js";

let img, res, stage, canvas, ctx, rect, n, dur;
let arr = [];
let els;

const funcs = [explode, explode2, melt];
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
    parseCtx();
    setElements();

    // explode();
    // explode2();
    // melt();
    run();

}

function run() {
    timeout = setTimeout(()=> {
        dur = 0;
        funcs[index]();
        index++;
        if (index > funcs.length-1) index = 0;
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


function explode() {

    for (let i = 0; i < n; i++) {
        let del = 100 + Math.random() * 100 + i * 2;
        let time = 1000 + Math.random() * 1000;
        const obj = arr[i];
        let x = obj.x + Math.random() * rect.width / 2 - Math.random() * rect.width / 2;
        let y = obj.y + Math.random() * rect.height - Math.random() * rect.height;
        // let rot = Math.random() * 180 - Math.random() * 180;

        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        let rgb = `rgb(${r}, ${g}, ${b})`;
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
                bg: {value: '#04e7ff', time: time / 2}
            },
            {delay: del, repeat: 1})
            .to(time, {y: 150});

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
            {y: "150", bg:'#04e7ff'},
            {repeat: 0, delay: del})
            .to(800, {x:x})
            .to(500, {x:obj.x, y:obj.y, bg:'#00ee00'});
            // .to(800, {x:-obj.x + 250,
            //     y:-obj.y + 100})

        if (dur < a.totalDuration) dur = a.totalDuration;

    }

}

