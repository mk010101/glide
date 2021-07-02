export const regValues = /[-%\w]+[-\d.]*/gi;
export const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
export const regColorVal = /([rgbahsl]+\([,%a-z \d.-]+\))|#[0-9A-F]{6}/gi;
export const regProp = /^[-\w]+[^( ]/gi;
export const regTypes = /Null|Number|String|Object|Array/g;
export const regNumsAndStrings = /[^\d.+=]+|[-+=.\d]+/g;
export const regNums = /[-.\d]+/g;
export const regColors = /[rgbahsl]{3,4}\([-.%0-9, degratun]+\)|#[0-9A-F]{6}/gi;
export const regVUs = /[-+*=/]*[.\d]+[a-z%]*/gi;
export const regNumsUnits = /[-=+/.*\d]+|[a-z%]*/gi;
export const regIncrements = /-=|\+=|\*=|\/=/g;
export function getObjType(val) {
    return Object.prototype.toString.call(val);
}
export const is = {
    dom(val) {
        return val.nodeType;
    },
    html(val) {
        return is.dom(val) && !is.svg(val);
    },
    svg(val) {
        return val instanceof SVGElement;
    },
    input(val) {
        return val instanceof HTMLInputElement;
    },
    tweenable(val) {
        return is.dom(val) || is.obj(val);
    },
    obj: function (val) {
        return getObjType(val).indexOf("Object") > -1;
    },
    array(val) {
        return Array.isArray(val);
    },
    list: function (val) {
        return is.array(val) || getObjType(val).indexOf("NodeList") > -1;
    },
    string(val) {
        return typeof val === 'string';
    },
    func(val) {
        return typeof val === 'function';
    },
    number(val) {
        return getObjType(val).indexOf("Number") > -1;
    },
    hex(val) {
        return /#[0-9A-F]{6}/i.test(val);
    },
    rgba(val) {
        return /rgb[^a]*/.test(val);
    },
    rgb(val) {
        return /rgb/.test(val);
    },
    hsla(val) {
        return /hsla/.test(val);
    },
    hsl(val) {
        return /hsl/.test(val);
    },
    valueColor(val) {
        return (is.hex(val) || is.rgb(val) || is.hsl(val));
    },
    propColor(val) {
        return /background-color|backgroundColor|color|fill|bg/i.test(val);
    },
    propDropShadow(val) {
        return /drop-shadow/i.test(val);
    },
    propNumeric(val) {
        return /opacity|scroll/i.test(val);
    },
    propDirect(val) {
        return /scrollTop/i.test(val);
    },
    propRotation(val) {
        return /rotate|skew/i.test(val);
    },
    mixed(val) {
        return /gradient/i.test(val);
    },
    propIndTransform(val) {
        return (/translate|^rotate|^scale|skew|matrix|x[(xyz]+|y[(xyz]+/i.test(val));
    },
    propTransform(val) {
        return (val === "transform");
    },
    propIndividualTr(val) {
        return (/translation|^rotation|^scaling|skewing|/i.test(val));
    },
    propMatrix(val) {
        return (/matrix[3d]*/i.test(val));
    },
    propFilter(val) {
        return (/filter|blur|brightness|contrast|drop-shadow|dropShadow|grayscale|hue-rotate|hueRotate|invert|opacity\(|saturate|sepia/i.test(val));
    },
    unitless(val) {
        return (/scale|matrix|opacity|color|background/i.test(val));
    },
    unitDegrees(val) {
        return (/rotate|skew/i.test(val));
    },
    propDual(val) {
        return (val === "translate" || val === "scale" || val === "skew");
    },
    unitPercent(val) {
        return (/invert|contrast|grayscale|saturate|sepia/i.test(val));
    },
    unitPx(val) {
        return !is.unitless(val) && !is.unitDegrees(val);
    },
    valueOne(val) {
        return (/scale|opacity|color|fill/i.test(val));
    },
};
