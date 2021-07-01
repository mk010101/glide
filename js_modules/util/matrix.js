const PI_180 = Math.PI / 180;
class Transforms2D {
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
export function mtx2DtoTransforms(str) {
    return decomposeMtx2D(strToMtx2D(str));
}
export function decomposeMtx2D(matrix) {
    let px = deltaTransformPoint(matrix, { x: 0, y: 1 });
    let py = deltaTransformPoint(matrix, { x: 1, y: 0 });
    let skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    let skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));
    return {
        translateX: matrix.e,
        translateY: matrix.f,
        skewX: skewX,
        skewY: skewY,
        rotate: skewX,
        scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
    };
}
function deltaTransformPoint(matrix, point) {
    let dx = point.x * matrix.a + point.y * matrix.c;
    let dy = point.x * matrix.b + point.y * matrix.d;
    return { x: dx, y: dy };
}
function strToMtx2D(str) {
    let arr = str.match(/[-.\d]+/g);
    let arrInd = ["a", "b", "c", "d", "e", "f"];
    let mtx = {};
    arr.map((v, i) => {
        mtx[arrInd[i]] = parseFloat(v);
    });
    return mtx;
}
