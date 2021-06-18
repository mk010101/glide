import { is } from "./util";
function toRgb(val) {
    if (is.hex(val)) {
        return hexToRGB(val);
    }
    else if (is.hsl(val)) {
        return hslToRgb(val);
    }
    else if (is.rgb(val)) {
        let res = val.match(/[-.\d]+/g);
        return res.map((v) => parseFloat(v));
    }
}
function toRgbStr(val) {
    let res = toRgb(val);
    let str = res.length === 4 ? "rgba" : "rgb";
    return `${str}(${res.join(", ")})`;
}
function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    let bigint;
    return [(bigint = parseInt(hex, 16)) >> 16 & 255, bigint >> 8 & 255, bigint & 255];
}
function hexToHsl(hex) {
    let rgb = hexToRGB(hex);
    return rgbToHsl(rgb[0], rgb[1], rgb[2]);
}
function rgbToHsl(r, g, b) {
    let min, max, i, l, s, maxcolor, h, rgb = [];
    rgb[0] = r / 255;
    rgb[1] = g / 255;
    rgb[2] = b / 255;
    min = rgb[0];
    max = rgb[0];
    maxcolor = 0;
    for (i = 0; i < rgb.length - 1; i++) {
        if (rgb[i + 1] <= min) {
            min = rgb[i + 1];
        }
        if (rgb[i + 1] >= max) {
            max = rgb[i + 1];
            maxcolor = i + 1;
        }
    }
    if (maxcolor == 0) {
        h = (rgb[1] - rgb[2]) / (max - min);
    }
    if (maxcolor == 1) {
        h = 2 + (rgb[2] - rgb[0]) / (max - min);
    }
    if (maxcolor == 2) {
        h = 4 + (rgb[0] - rgb[1]) / (max - min);
    }
    if (isNaN(h)) {
        h = 0;
    }
    h = h * 60;
    if (h < 0) {
        h = h + 360;
    }
    l = (min + max) / 2;
    if (min == max) {
        s = 0;
    }
    else {
        if (l < 0.5) {
            s = (max - min) / (max + min);
        }
        else {
            s = (max - min) / (2 - max - min);
        }
    }
    return [h, s * 100, l * 100];
}
function hslToRgb(hsl) {
    let [sh, ss, sl, sa] = hsl.match(/[-.\d]+/g);
    let h = parseFloat(sh);
    let s = parseFloat(ss);
    let l = parseFloat(sl);
    let a;
    if (sa)
        a = parseFloat(sa);
    s /= 100;
    l /= 100;
    let C = (1 - Math.abs(2 * l - 1)) * s;
    let hue = h / 60;
    let X = C * (1 - Math.abs(hue % 2 - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (hue >= 0 && hue < 1) {
        r = C;
        g = X;
    }
    else if (hue >= 1 && hue < 2) {
        r = X;
        g = C;
    }
    else if (hue >= 2 && hue < 3) {
        g = C;
        b = X;
    }
    else if (hue >= 3 && hue < 4) {
        g = X;
        b = C;
    }
    else if (hue >= 4 && hue < 5) {
        r = X;
        b = C;
    }
    else {
        r = C;
        b = X;
    }
    let m = l - C / 2;
    r += m;
    g += m;
    b += m;
    r *= 255.0;
    g *= 255.0;
    b *= 255.0;
    let arr = [Math.round(r), Math.round(g), Math.round(b)];
    if (a)
        arr.push(a);
    return arr;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
