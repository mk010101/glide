const PI_180 = Math.PI / 180;

export function rotToMtx(deg:number, mtx:number[] = null) {

    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    const rad = toRad(deg);
    mtx[0] = Math.cos(rad);
    mtx[1] = Math.sin(rad);
    mtx[2] = -Math.sin(rad);
    mtx[3] = Math.cos(rad);
    return mtx;
}

export function translateToMtx(x:number = null, y:number = null, mtx:number[] = null) {
    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    if (x) mtx[4] = x;
    if (y) mtx[5] = y;
    return mtx;
}

export function skewToMtx(x:number = null, y:number = null, mtx:number[] = null) {
    if (!mtx) mtx = [1, 0, 0, 1, 0, 0];
    if (x) mtx[2] = Math.tan(toRad(x));
    if (y) mtx[1] = Math.tan(toRad(y));
    return mtx;
}


function toRad(deg:number) {
    return deg * PI_180;
}