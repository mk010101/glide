import glide from "./libs/glide.esm.js";

const num = 1000;
let img, res, stage, canvas, ctx, rect, n;
let arr = [];
let els;


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

    parseCtx();
    setElements();

    explode();

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
        let del = 500 + Math.random() * 100 + i * 2;
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
        // let rgb = `rbg(200, 0, 0)`;

        // glide.to(els[i], time, {x: x, y: {value:y, duration: time + 500}, scale:scStr, opacity:0}, {delay: del, repeat: 1})
        glide.to(els[i], time,
            {x: x, y: {value: y, duration: time + 500}, scale: scStr, bg: rgb},
            {delay: del, repeat: 1, ease: 'quadInOut'})
            .to(500, {y: "+=10"})


    }
}
