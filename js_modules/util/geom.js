export function decomposeMatrix(matrix) {
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
