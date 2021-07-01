const PI_180 = Math.PI / 180;


export type Pt = {
    x: number;
    y: number;
}

type Mtx2D = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export type Trans2D = {
    translateX: number;
    translateY: number;
    skewX: number;
    skewY: number;
    rotate: number;
    scaleX: number;
    scaleY: number;
}

class Transforms2D {
    translateX: number = 0;
    translateY: number = 0;
    skewX: number = 0;
    skewY: number = 0;
    rotate: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;
}


/**
 * Decomposes Matrix string (a, b, c, d, e, f..) to individual transforms.
 * @param str string Matrix.
 */
export function mtx2DtoTransforms(str:string):Trans2D {
    return decomposeMtx2D(strToMtx2D(str));
}


export function decomposeMtx2D(matrix: Mtx2D): Trans2D {

    // @see https://gist.github.com/2052247

    // calculate delta transform point
    let px = deltaTransformPoint(matrix, {x: 0, y: 1});
    let py = deltaTransformPoint(matrix, {x: 1, y: 0});

    // calculate skew
    let skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    let skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
        translateX: matrix.e,
        translateY: matrix.f,
        skewX: skewX,
        skewY: skewY,
        rotate: skewX, // rotation is the same as skew x
        scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
    };
}


function deltaTransformPoint(matrix: Mtx2D, point: Pt) {

    let dx = point.x * matrix.a + point.y * matrix.c;// + 0;
    let dy = point.x * matrix.b + point.y * matrix.d;// + 0;
    return {x: dx, y: dy};
}

function strToMtx2D(str: string): Mtx2D {
    let arr = str.match(/[-.\d]+/g);
    let arrInd = ["a", "b", "c", "d", "e", "f"];
    let mtx: any = {};
    arr.map((v: string, i: number) => {
        mtx[arrInd[i]] = parseFloat(v);
    });
    return mtx;
}


/*



export function rotToMtx(deg: number, mtx: number[] = null) {

    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    const rad = toRad(deg);
    mtx[0] = Math.cos(rad);
    mtx[1] = Math.sin(rad);
    mtx[2] = -Math.sin(rad);
    mtx[3] = Math.cos(rad);
    return mtx;
}

export function translateToMtx(x: number = null, y: number = null, mtx: number[] = null) {
    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    if (x) mtx[4] = x;
    if (y) mtx[5] = y;
    return mtx;
}

export function skewToMtx(x: number = null, y: number = null, mtx: number[] = null) {
    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    if (x) mtx[2] = Math.tan(toRad(x));
    if (y) mtx[1] = Math.tan(toRad(y));
    return mtx;
}


function toRad(deg: number) {
    return deg * PI_180;
}


 */