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

class $Trans2D {
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
export function getNormalizedTransforms(str: string): Trans2D {
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
    if (!str || str.indexOf("matrix") === -1)
        return getMtx2D();
    let arr = str.match(/[-.\d]+/g);
    let arrInd = ["a", "b", "c", "d", "e", "f"];
    let mtx: any = {};
    for (let i = 0; i < 6; i++) {
        mtx[arrInd[i]] = parseFloat(arr[i]);
    }
    return mtx;
}

export function getMtx2D(): Mtx2D {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
    }
}


/* =====================================================================================================================
    MATRIX-2D MATH
======================================================================================================================*/




export function translateX(mtx: Mtx2D, tx: number): Mtx2D {
    applyTransform(mtx, 1, 0, 0, 1, tx, 0);
    return mtx;
}


export function translateY(mtx: Mtx2D, ty: number): Mtx2D {
    applyTransform(mtx, 1, 0, 0, 1, 0, ty);
    return mtx;
}


export function rotate(mtx: Mtx2D, deg: number): Mtx2D {
    let rad = toRad(deg);
    let cos = Math.cos(rad),
        sin = Math.sin(rad);
    applyTransform(mtx, cos, sin, -sin, cos, 0, 0);
    return mtx;
}

export function scaleX(mtx: Mtx2D, sx: number): Mtx2D {
    applyTransform(mtx, sx, 0, 0, 1, 0, 0);
    return mtx;
}

export function scaleY(mtx: Mtx2D, sy: number): Mtx2D {
    applyTransform(mtx, 1, 0, 0, sy, 0, 0);
    return mtx;
}


/**
 * Multiplies current matrix with new matrix values.
 * @param {Mtx2D} mtx1 - matrix to apply transforms to.
 * @param {number} a - scale x
 * @param {number} b - skew y
 * @param {number} c - skew x
 * @param {number} d - scale y
 * @param {number} e - translate x
 * @param {number} f - translate y
 */
function applyTransform(mtx1: Mtx2D, a: number, b: number, c: number, d: number, e: number, f: number) {

    mtx1.a = mtx1.a * a + mtx1.c * b;
    mtx1.b = mtx1.b * a + mtx1.d * b;
    mtx1.c = mtx1.a * c + mtx1.c * d;
    mtx1.d = mtx1.b * c + mtx1.d * d;
    mtx1.e = mtx1.a * e + mtx1.c * f + mtx1.e;
    mtx1.f = mtx1.b * e + mtx1.d * f + mtx1.f;

}


function toRad(deg: number) {
    return deg * PI_180;
}



