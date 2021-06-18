
export const regValues = /[-%\w]+[-\d.]*/gi;
export const regVUs = /[-+=.\w%]+/g;
export const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
export const regColorVal = /([rgbahsl]+\([,%a-z \d.-]+\))|#[0-9A-F]{6}/gi;
export const regProp = /^[-\w]+[^( ]/gi;
export const regTypes = /Null|Number|String|Object|Array/g;


export function getObjType(val: any): string {
    return Object.prototype.toString.call(val);
}

export const is = {
    dom(val: any) {
        return val.nodeType
    },
    html(val: any) {
        return is.dom(val) && !is.svg(val);
    },
    svg(val: any) {
        return val instanceof SVGElement;
    },
    input(val: any) {
        return val instanceof HTMLInputElement;
    },
    tweenable(val: any) {
        return is.dom(val) || is.obj(val);
    },
    obj: function (val: any) {
        return getObjType(val).indexOf("Object") > -1;
    },
    array(val: any) {
        return Array.isArray(val);
    },
    list: function (val: any) {
        return is.array(val) || getObjType(val).indexOf("NodeList") > -1
    },
    string(val: any) {
        return typeof val === 'string';
    },
    func(val: any) {
        return typeof val === 'function';
    },
    number(val: any) {
        return getObjType(val).indexOf("Number") > -1;
    },
    hex(val: any) {
        return /#[0-9A-F]{6}/i.test(val);
    },
    rgba(val: any) {
        return /rgb[^a]*/.test(val);
    },
    rgb(val: any) {
        return /rgb/.test(val);
    },
    hsla(val: any) {
        return /hsla/.test(val);
    },
    hsl(val: any) {
        return /hsl/.test(val);
    },
    valueColor(val: any) {
        return (is.hex(val) || is.rgb(val) || is.hsl(val));
    },
    propColor(val: any) {
        return /background-color|backgroundColor|color|fill|bg/i.test(val);
    },
    propDropShadow(val: any) {
        return /drop-shadow/i.test(val);
    },
    propNumeric(val: any) {
        return /opacity|scroll/i.test(val);
    },
    propDirect(val: any) {
        return /scrollTop/i.test(val);
    },
    propRotation(val: any) {
        return /rotate|skew/i.test(val);
    },
    mixed(val: any) {
        return /gradient/i.test(val);
    },
    propTransform(val: any) {
        return (/translate|^rotate|^scale|skew|matrix|x[(xyz]+|y[(xyz]+/i.test(val));
    },
    propMatrix(val: any) {
        return (/matrix[3d]*/i.test(val));
    },
    propFilter(val: any) {
        // return (/filter/i.test(val));
        return (/filter|blur|brightness|contrast|drop-shadow|dropShadow|grayscale|hue-rotate|hueRotate|invert|opacity\(|saturate|sepia/i.test(val));
    },
    unitless(val: any) {
        return (/scale|matrix|opacity|color|background/i.test(val));
    },
    unitDegrees(val: any) {
        return (/rotate|skew/i.test(val));
    },
    valDual(val: any) {
        return (/translate\(|scale\(|skew\(/i.test(val));
    },
    unitPercent(val: any) {
        return (/invert|contrast|grayscale|saturate|sepia/i.test(val));
    },
    unitPx(val: any) {
        return !is.unitless(val) && !is.unitDegrees(val);
    },
    valueOne(val: any) {
        return (/scale|opacity/i.test(val));
    },
};