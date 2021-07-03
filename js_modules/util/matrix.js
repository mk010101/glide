import { getDefaultUnit } from "./util";
const PI_180 = Math.PI / 180;
class $Trans2D {
    constructor() {
        this.translateX = 0;
        this.translateY = 0;
        this.skewX = 0;
        this.skewY = 0;
        this.rotate = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }
}
export function getNormalizedTransforms(str) {
    const decomp = decomposeMtx2D(strToMtx2D(str));
    let res = "";
    decomp.forEach((v, k) => {
        let unit = getDefaultUnit(k, "dom");
        res += `${k}(${v}${unit}) `;
    });
    return res;
}
export function decomposeMtx2D(matrix) {
    let px = deltaTransformPoint(matrix, { x: 0, y: 1 });
    let py = deltaTransformPoint(matrix, { x: 1, y: 0 });
    let skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    let skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));
    let map = new Map();
    map.set("translateX", matrix.e);
    map.set("translateY", matrix.f);
    map.set("skewX", skewX);
    map.set("skewY", skewY);
    map.set("rotate", skewX);
    map.set("scaleX", Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b));
    map.set("scaleY", Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d));
    return map;
}
function deltaTransformPoint(matrix, point) {
    let dx = point.x * matrix.a + point.y * matrix.c;
    let dy = point.x * matrix.b + point.y * matrix.d;
    return { x: dx, y: dy };
}
function strToMtx2D(str) {
    if (!str || str.indexOf("matrix") === -1)
        return getMtx2D();
    let arr = str.match(/[-.\d]+/g);
    let arrInd = ["a", "b", "c", "d", "e", "f"];
    let mtx = {};
    for (let i = 0; i < 6; i++) {
        mtx[arrInd[i]] = parseFloat(arr[i]);
    }
    return mtx;
}
export function getMtx2D() {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
    };
}
export function translateX(mtx, tx) {
    applyTransform(mtx, 1, 0, 0, 1, tx, 0);
    return mtx;
}
export function translateY(mtx, ty) {
    applyTransform(mtx, 1, 0, 0, 1, 0, ty);
    return mtx;
}
export function rotate(mtx, deg) {
    let rad = toRad(deg);
    let cos = Math.cos(rad), sin = Math.sin(rad);
    applyTransform(mtx, cos, sin, -sin, cos, 0, 0);
    return mtx;
}
export function scaleX(mtx, sx) {
    applyTransform(mtx, sx, 0, 0, 1, 0, 0);
    return mtx;
}
export function scaleY(mtx, sy) {
    applyTransform(mtx, 1, 0, 0, sy, 0, 0);
    return mtx;
}
function applyTransform(mtx1, a, b, c, d, e, f) {
    mtx1.a = mtx1.a * a + mtx1.c * b;
    mtx1.b = mtx1.b * a + mtx1.d * b;
    mtx1.c = mtx1.a * c + mtx1.c * d;
    mtx1.d = mtx1.b * c + mtx1.d * d;
    mtx1.e = mtx1.a * e + mtx1.c * f + mtx1.e;
    mtx1.f = mtx1.b * e + mtx1.d * f + mtx1.f;
}
function toRad(deg) {
    return deg * PI_180;
}
