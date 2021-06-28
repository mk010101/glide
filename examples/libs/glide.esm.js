const PI = Math.PI;
class Context {
    constructor(parent) {
        this.units = {
            px: 16,
            em: 1,
            rem: 1,
            vw: 1,
            vh: 1,
            vmin: 1,
            vmax: 1,
            cm: 1,
            mm: 1,
            in: 1,
            pt: 1,
            pc: 1,
            "%": 1,
        };
        this.setUnits(parent);
    }
    setUnits(parent) {
        let p;
        if (typeof parent === "string") {
            p = document.querySelector(parent);
        }
        else if (parent && parent.nodeType === 1) {
            p = parent;
        }
        else {
            p = undefined;
        }
        if (!p) {
            console.warn(`Glide.Context: parent "${parent}" could not be found.`);
            return;
        }
        let el = document.createElement("div");
        el.style.position = "absolute";
        el.style.visibility = "invisible";
        el.style.width = "1px";
        el.style.height = "1px";
        p.appendChild(el);
        const computed = window.getComputedStyle(el);
        let keys = Object.keys(this.units);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            el.style.width = 1 + key;
            this.units[key] = parseFloat(computed.width);
        }
        p.removeChild(el);
    }
    static convertUnits(val, from, to, units) {
        if (from === "deg" && to === "rad")
            return val * PI / 180;
        else if (from === "rad" && to === "deg")
            return val / PI * 180;
        if (from === "deg" && to === "rad")
            return val * PI / 180;
        else if (from === "turn" && to === "deg")
            return val * 360;
        if (from === "deg" && to === "turn")
            return val / 360;
        let px = units[from];
        let un = units[to];
        return px / un * val;
    }
}

const regValues = /[-%\w]+[-\d.]*/gi;
const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
const regProp = /^[-\w]+[^( ]/gi;
const regColors = /[rgbahsl]{3,4}\([-.%0-9, degratun]+\)|#[0-9A-F]{6}/gi;
const regVUs = /[-+*=/]*[.\d]+[a-z%]*/gi;
const regNumsUnits = /[-=+/.*\d]+|[a-z%]*/gi;
const regIncrements = /-=|\+=|\*=|\/=/g;
function getObjType(val) {
    return Object.prototype.toString.call(val);
}
const is = {
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
    propTransform(val) {
        return (/translate|^rotate|^scale|skew|matrix|x[(xyz]+|y[(xyz]+/i.test(val));
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

class Target {
    constructor(target, context) {
        this.pos = 0;
        this.el = target;
        this.context = context;
        this.init();
    }
    init() {
        this.type = is.dom(this.el) ? "dom" : "obj";
        if (this.type === "dom") {
            this.style = this.el.style;
            this.tweenable = this.style;
            this.computedStyle = window.getComputedStyle(this.el);
        }
        else {
            this.tweenable = this.el;
        }
    }
    getExistingValue(prop) {
        let res;
        if (this.type === "obj" || is.propDirect(prop)) {
            return this.el[prop];
        }
        else {
            if (is.propTransform(prop))
                prop = "transform";
            else if (is.propFilter(prop))
                prop = "filter";
        }
        if (this.style) {
            res = this.style[prop];
        }
        if ((!res || res === "none" || res === "") && this.computedStyle) {
            res = this.computedStyle[prop];
        }
        if (!res || res === "none" || res === "") {
            return null;
        }
        return res;
    }
    setValue(prop, val) {
        if (this.type === "dom") {
            this.style[prop] = val;
        }
        else {
            this.el[prop] = val;
        }
    }
}

class Dispatcher {
    constructor() {
        this._listeners = {};
    }
    on(evtName, listener) {
        if (!this._listeners[evtName])
            this._listeners[evtName] = [];
        if (this._listeners[evtName].indexOf(listener) === -1) {
            this._listeners[evtName].push(listener);
        }
        return this;
    }
    off(evtName, listener) {
        if (this._listeners[evtName]) {
            let index = this._listeners[evtName].indexOf(listener);
            if (index > -1)
                this._listeners[evtName] = this._listeners[evtName].splice(index, 1);
        }
        return this;
    }
    offAll() {
        for (let p in this._listeners) {
            this._listeners[p] = [];
        }
    }
    dispatch(evtName, data) {
        if (!this._listeners[evtName])
            return;
        for (let i = 0; i < this._listeners[evtName].length; i++) {
            this._listeners[evtName][i](data);
        }
    }
}

class Vo {
    constructor() {
        this.numbers = [];
        this.floats = [];
        this.units = [];
        this.increments = [];
        this.strings = [];
    }
}
class TweenGroup {
    constructor(target) {
        this.target = null;
        this.tweens = [];
        this.target = target;
    }
}

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
    if (res.length === 3)
        res.push(1);
    let str = res.length === 4 ? "rgba" : "rgb";
    return `${str}(${res.join(", ")})`;
}
function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    let bigint;
    return [(bigint = parseInt(hex, 16)) >> 16 & 255, bigint >> 8 & 255, bigint & 255];
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

function powerInOut(pow) {
    return function (t) {
        if ((t *= 2) < 1)
            return 0.5 * Math.pow(t, pow);
        return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
    };
}
function powerIn(pow) {
    return function (t) {
        return Math.pow(t, pow);
    };
}
function powerOut(pow) {
    return function (t) {
        return 1 - Math.pow(1 - t, pow);
    };
}
function getBackIn(s = 1.70158) {
    return function (t = 0.0) {
        return t * t * ((s + 1) * t - s);
    };
}
function getBackOut(s = 1.70158) {
    return function (t = 0.0) {
        return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    };
}
function getBackInOut(s = 1.70158) {
    return function (t = 0.0) {
        if ((t *= 2) < 1)
            return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    };
}
function getElasticIn(period = 0.3, amplitude = 1.70158) {
    return function (t) {
        let a = 1;
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        if (!period)
            period = 0.3;
        amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period));
    };
}
function getElasticOut(period = 0.3, amplitude = 1.70158) {
    return function (t) {
        let a = 1;
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t - amplitude) * (2 * Math.PI) / period) + 1;
    };
}
function getElasticInOut(period = 0.45, amplitude = 1.70158) {
    return function (t) {
        let a = 1;
        if (t === 0)
            return 0;
        if ((t /= 1 / 2) === 2)
            return 1;
        amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        if (t < 1)
            return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period));
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period) * 0.5 + 1;
    };
}
function linear(t = 0.0) {
    return t;
}
function quadIn(t = 0.0) {
    return t * t;
}
function quadOut(t = 0.0) {
    return t * (2 - t);
}
function quadInOut(t = 0.0) {
    if (t < 0.5)
        return 2.0 * t * t;
    else
        return -1.0 + (4.0 - 2.0 * t) * t;
}
const cubicIn = powerIn(3);
const cubicOut = powerOut(3);
const cubicInOut = powerInOut(3);
const backIn = getBackIn();
const backOut = getBackOut();
const backInOut = getBackInOut();
const elasticIn = getElasticIn();
const elasticOut = getElasticOut();
const elasticInOut = getElasticInOut();
function circleIn(t = 0.0) {
    return -1 * (Math.sqrt(1 - t * t) - 1);
}
function circleOut(t = 0.0) {
    return Math.sqrt(1 - (t = t - 1) * t);
}
function circleInOut(t = 0.0) {
    if ((t /= 1 / 2) < 1)
        return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
    return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}
function expoIn(t = 0.0) {
    return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
}
function expoOut(t = 0.0) {
    return (t === 1) ? 1 : (-Math.pow(2, -10 * t) + 1);
}
function expoInOut(t = 0.0) {
    if (t === 0)
        return 0;
    if (t === 1)
        return 1;
    if ((t /= 1 / 2) < 1)
        return 1 / 2 * Math.pow(2, 10 * (t - 1));
    return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
}
function bounceIn(t) {
    return 1 - bounceOut(1 - t);
}
function bounceOut(t) {
    if (t < 1 / 2.75) {
        return (7.5625 * t * t);
    }
    else if (t < 2 / 2.75) {
        return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    }
    else if (t < 2.5 / 2.75) {
        return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    }
    else {
        return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
    }
}
function bounceInOut(t) {
    if (t < 0.5)
        return bounceIn(t * 2) * .5;
    return bounceOut(t * 2 - 1) * 0.5 + 0.5;
}
function stepped(steps = 5) {
    return function (t) {
        if (t <= 0) {
            return 0;
        }
        else if (t >= 1) {
            return 1;
        }
        else {
            return ((steps * t) | 0) * (1 / steps);
        }
    };
}

var ease = /*#__PURE__*/Object.freeze({
    __proto__: null,
    powerInOut: powerInOut,
    powerIn: powerIn,
    powerOut: powerOut,
    getBackIn: getBackIn,
    getBackOut: getBackOut,
    getBackInOut: getBackInOut,
    getElasticIn: getElasticIn,
    getElasticOut: getElasticOut,
    getElasticInOut: getElasticInOut,
    linear: linear,
    quadIn: quadIn,
    quadOut: quadOut,
    quadInOut: quadInOut,
    cubicIn: cubicIn,
    cubicOut: cubicOut,
    cubicInOut: cubicInOut,
    backIn: backIn,
    backOut: backOut,
    backInOut: backInOut,
    elasticIn: elasticIn,
    elasticOut: elasticOut,
    elasticInOut: elasticInOut,
    circleIn: circleIn,
    circleOut: circleOut,
    circleInOut: circleInOut,
    expoIn: expoIn,
    expoOut: expoOut,
    expoInOut: expoInOut,
    bounceIn: bounceIn,
    bounceOut: bounceOut,
    bounceInOut: bounceInOut,
    stepped: stepped
});

class Tween {
    constructor(twType, prop, fromVal, toVal, duration, delay, start) {
        this.tweenable = null;
        this.twType = null;
        this.prop = "";
        this.duration = 0.0;
        this.delay = 0.0;
        this.start = 0.0;
        this.totalDuration = 0.0;
        this.fromVal = null;
        this.toVal = null;
        this.from = null;
        this.to = null;
        this.ease = quadInOut;
        this.keepOld = false;
        this.oldValue = "";
        this.twType = twType;
        this.prop = prop;
        this.duration = duration;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay;
    }
}

function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}
function getTweenType(targetType, prop) {
    if (targetType === "obj")
        return "obj";
    else if (is.propTransform(prop))
        return "transform";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propDirect(prop))
        return "direct";
    return "other";
}
function getPropType(prop) {
    if (is.propTransform(prop))
        return "transform";
    else if (is.propColor(prop))
        return "color";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propMatrix(prop))
        return "matrix";
    return "other";
}
function getDefaultUnit(prop, targetType) {
    if (targetType === "obj") {
        return null;
    }
    if (is.unitDegrees(prop))
        return "deg";
    else if (is.unitPercent(prop))
        return "%";
    else if (is.unitless(prop))
        return "";
    return "px";
}
function getDefaultValue(prop) {
    if (prop === "saturate")
        return 100;
    else if (is.valueOne(prop))
        return 1;
    return 0;
}
function unwrapValues(prop, val) {
    const propX = prop + "X";
    const propY = prop + "Y";
    if (is.number(val)) {
        return [
            { prop: propX, val: val },
            { prop: propY, val: val }
        ];
    }
    else if (is.string(val)) {
        let res = val.match(regValues);
        if (res.length === 1) {
            res.push(is.valueOne(prop) ? "1" : "0");
        }
        return [
            { prop: propX, val: res[0] },
            { prop: propY, val: res[1] }
        ];
    }
    else if (is.array(val)) {
        if (val.lengh === 1)
            val.push(val[0]);
        return [
            { prop: propX, val: val[0] },
            { prop: propY, val: val[1] }
        ];
    }
}
function getDefaultVo(prop, val = null) {
    let vo = new Vo();
    if (val == null)
        return vo;
    if (is.propFilter(prop) || is.propTransform(prop)) {
        vo.numbers.push(null, val, null);
        vo.floats.push(1, 1, 1);
        vo.units.push(null, null, null);
        vo.strings.push(prop + "(", null, ")");
        vo.increments.push(null, null, null);
    }
    else {
        vo.numbers.push(val);
        vo.floats.push(1);
        vo.units.push(null);
        vo.strings.push(null);
        vo.increments.push(null);
    }
    return vo;
}
function addBraces(vo, prop) {
    if (is.propTransform(prop) || is.propFilter(prop)) {
        vo.strings.unshift(prop + "(");
        vo.numbers.unshift(null);
        vo.increments.unshift(null);
        vo.floats.unshift(1);
        vo.units.unshift(null);
        vo.strings.push(")");
        vo.numbers.push(null);
        vo.increments.push(null);
        vo.floats.push(1);
        vo.units.push(null);
    }
}
function getVo(targetType, prop, val) {
    let vo = new Vo();
    let res = [];
    getPropType(prop);
    if (val == void 0) {
        vo = getDefaultVo(prop, val);
        return vo;
    }
    else if (is.number(val)) {
        return getDefaultVo(prop, val);
    }
    let arrColors = val.match(regColors);
    let arrCombined = [];
    if (arrColors) {
        if (prop === "drop-shadow") {
            val = arrColors[0] + " " + val.replace(arrColors[0], "");
        }
        for (let i = 0; i < arrColors.length; i++) {
            arrColors[i] = toRgbStr(arrColors[i]);
        }
        let strParts = val.split(regColors);
        arrCombined = recombineNumsAndStrings(arrColors, strParts);
    }
    else {
        arrCombined = [val];
    }
    for (let i = 0; i < arrCombined.length; i++) {
        let p = arrCombined[i];
        if (p === "")
            continue;
        getVUs(p);
        res.push(...getVUs(p));
    }
    for (let i = res.length - 1; i >= 0; i--) {
        let p = res[i];
        let vus = p.match(regVUs);
        if (vus) {
            let vus = p.match(regNumsUnits);
            let num = 0.0;
            let digStr = vus[0];
            let unit = vus[1] || null;
            let incr = null;
            let incrMatch = digStr.match(regIncrements);
            if (incrMatch) {
                incr = incrMatch[0][0];
                digStr = digStr.replace(incrMatch[0], "");
            }
            num = parseFloat(digStr);
            vo.numbers.unshift(num);
            vo.floats.unshift(1);
            vo.units.unshift(unit);
            vo.increments.unshift(incr);
            vo.strings.unshift(null);
        }
        else if (p !== "") {
            vo.numbers.unshift(null);
            vo.units.unshift(null);
            vo.increments.unshift(null);
            vo.strings.unshift(p);
            vo.floats.push(1);
        }
    }
    addBraces(vo, prop);
    return vo;
}
function getVUs(str) {
    let res = [];
    if (!regVUs.test(str) && !regColors.test(str)) {
        res.push(str);
    }
    else if (regColors.test(str)) {
        let cols = getVUsArr(str);
        for (let i = 0; i < cols.length; i++) {
            res.push(cols[i]);
        }
    }
    else {
        let others = getVUsArr(str);
        res.push(...others);
    }
    return res;
}
function getVUsArr(str) {
    let resNums = [];
    let resStr = [];
    let res = [];
    let nums = str.match(regVUs);
    if (nums) {
        let strings = str.split(regVUs);
        for (let i = 0; i < nums.length; i++) {
            resNums.push(nums[i]);
        }
        for (let i = 0; i < strings.length; i++) {
            resStr.push(strings[i]);
        }
    }
    while (resNums.length > 0 || resStr.length > 0) {
        if (resStr.length > 0)
            res.push(resStr.shift());
        if (resNums.length > 0)
            res.push(resNums.shift());
    }
    return res;
}
function recombineNumsAndStrings(numArr, strArr) {
    let res = [];
    while (numArr.length > 0 || strArr.length > 0) {
        if (strArr.length > 0)
            res.push(strArr.shift());
        if (numArr.length > 0)
            res.push(numArr.shift());
    }
    return res;
}
function normalizeTween(tw, target) {
    var _a, _b;
    const prop = tw.prop;
    let from = tw.from;
    let to = tw.to;
    tw.twType;
    getPropType(prop);
    const defaultUnit = getDefaultUnit(prop, target.type);
    const defaultValue = getDefaultValue(prop);
    if (from.numbers.length !== to.numbers.length) {
        let shorter = from.numbers.length > to.numbers.length ? to : from;
        let longer = shorter === from ? to : from;
        shorter.strings = longer.strings;
        for (let i = shorter.numbers.length; i < longer.numbers.length; i++) {
            if (longer.numbers[i] != null) {
                shorter.numbers.push(defaultValue);
                shorter.units.push(defaultUnit);
            }
            else {
                shorter.numbers.push(null);
                shorter.units.push(null);
            }
            shorter.increments.push(null);
        }
    }
    for (let i = 0; i < to.numbers.length; i++) {
        if (((_a = to.strings[i]) === null || _a === void 0 ? void 0 : _a.indexOf("rgb")) > -1) {
            from.units[i + 1] = from.units[i + 3] = from.units[i + 5] =
                to.units[i + 1] = to.units[i + 3] = to.units[i + 5] = "";
            to.floats[i + 1] = to.floats[i + 3] = to.floats[i + 5] = 0;
            if (((_b = to.strings[i]) === null || _b === void 0 ? void 0 : _b.indexOf("rgba")) > -1) {
                to.units[i + 7] = from.units[i + 7] = "";
            }
        }
        if (to.numbers[i] != null) {
            if (from.units[i] == null)
                from.units[i] = defaultUnit;
            if (to.units[i] == null) {
                to.units[i] = from.units[i];
            }
            if (from.units[i] !== to.units[i]) {
                from.numbers[i] = Context.convertUnits(from.numbers[i], from.units[i], to.units[i], target.context.units);
            }
            let incr = to.increments[i];
            if (incr === "-") {
                to.numbers[i] = from.numbers[i] - to.numbers[i];
            }
            else if (incr === "+") {
                to.numbers[i] += from.numbers[i];
            }
            else if (incr === "*") {
                to.numbers[i] *= from.numbers[i];
            }
            else if (incr === "/") {
                to.numbers[i] /= from.numbers[i];
            }
        }
    }
}
function strToMap(str, twType) {
    let res = new Map();
    if (!str || str === "" || str === "none")
        return null;
    let arr = str.match(regStrValues);
    if (!arr)
        return null;
    for (let i = 0; i < arr.length; i++) {
        let part = arr[i];
        let prop = part.match(regProp)[0];
        part = part.replace(prop, "");
        part = part.replace(/^\(|\)$/g, "");
        let vo = getVo("dom", prop, part);
        if (is.propDual(prop)) {
            let propX = prop + "X";
            let propY = prop + "Y";
            let part2 = part.replace(prop, "");
            let vus = part2.match(regValues);
            if (vus.length === 1)
                vus.push(is.valueOne(prop) ? "1" : "0");
            let vox = getVo("dom", propX, vus[0]);
            let twx = new Tween(twType, propX, null, null, 0, 0, 0);
            twx.keepOld = true;
            twx.oldValue = `${propX}(${vus[0]})`;
            let voy = getVo("dom", propY, vus[1]);
            let twy = new Tween(twType, propX, null, null, 0, 0, 0);
            twy.keepOld = true;
            twy.oldValue = `${propY}(${vus[1]})`;
            twx.from = vox;
            res.set(propX, twx);
            twy.from = voy;
            res.set(propY, twy);
        }
        else {
            let tw = new Tween(twType, prop, null, null, 0, 0, 0);
            tw.from = vo;
            tw.keepOld = true;
            tw.oldValue = `${prop}(${part})`;
            res.set(tw.prop, tw);
        }
    }
    return res;
}

class Keyframe {
    constructor() {
        this.duration = 0;
        this.totalDuration = 0;
        this.initialized = false;
        this.tgs = [];
        this.callFunc = null;
        this.callParams = null;
        this.startTime = 0;
    }
    push(tg) {
        for (let i = 0; i < tg.tweens.length; i++) {
            let tw = tg.tweens[i];
            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }
        }
        this.tgs.push(tg);
    }
}

const progress = "progress";
const end = "end";
const Evt = {
    progress: progress,
    end: end,
};

const Ease = ease;
class Animation extends Dispatcher {
    constructor(targets, duration, params, options = {}) {
        super();
        this.status = 1;
        this.targets = [];
        this.keyframes = [];
        this.paused = false;
        this.time = 0.0;
        this.totalDuration = 0.0;
        this.currentTime = 0.0;
        this.runningTime = 0.0;
        this.playedTimes = 0;
        this.loop = true;
        this.repeat = 1;
        this._pos = 0;
        this._seeking = false;
        this._preSeekState = 1;
        this._dir = 1;
        this.repeat = (options.repeat != (void 0) && options.repeat > 0) ? options.repeat + 1 : 1;
        this.loop = options.loop != (void 0) ? options.loop : true;
        this.paused = options.paused != (void 0) ? options.paused : false;
        this.keep = options.keep != (void 0) ? options.keep : false;
        this.targets = Animation._getTargets(targets, options);
        this.to(duration, params, options);
    }
    to(duration, params, options = {}) {
        let kf = new Keyframe();
        for (let i = 0; i < this.targets.length; i++) {
            const tg = Animation._getTweens(this.targets[i], duration, params, options);
            kf.push(tg);
        }
        kf.startTime = this.totalDuration / this.repeat;
        this.totalDuration += kf.totalDuration * this.repeat;
        this.keyframes.push(kf);
        if (!this._currentKf) {
            this._currentKf = kf;
        }
        return this;
    }
    update(t) {
        if ((this.paused && !this._seeking) || this.status === -1)
            return;
        if (!this._currentKf.initialized) {
            Animation._initTweens(this._currentKf);
            this._currentKf.initialized = true;
        }
        const tgs = this._currentKf.tgs;
        this.dispatch(Evt.progress, null);
        Animation._render(tgs, this.time, this._dir);
        if (this.currentTime >= this._currentKf.totalDuration) {
            if (this._currentKf.callFunc) {
                this._currentKf.callFunc(this._currentKf.callParams);
            }
            if (this._dir > 0 && this.keyframes.length > this._pos + 1) {
                this._pos++;
                this.time = 0;
                this._currentKf = this.keyframes[this._pos];
            }
            else if (this._dir < 0 && this._pos > 0) {
                this._pos--;
                this._currentKf = this.keyframes[this._pos];
                this.time = this._currentKf.totalDuration;
            }
            else {
                this.playedTimes++;
                if (this.playedTimes < this.repeat) {
                    if (this.loop) {
                        this._dir *= -1;
                    }
                    else {
                        this.reset();
                        this._currentKf = this.keyframes[0];
                    }
                }
                else {
                    this.status = this.status = this.keep ? 0 : -1;
                    this.dispatch(Evt.end, null);
                }
            }
            this.currentTime = 0;
        }
        this.time += t * this._dir;
        this.currentTime += t;
        this.runningTime += t;
    }
    call(func, ...params) {
        let kf = new Keyframe();
        kf.callFunc = func;
        kf.callParams = params;
        this.keyframes.push(kf);
        return this;
    }
    remove(target) {
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            let kf = this.keyframes[i];
            for (let j = kf.tgs.length - 1; j >= 0; j--) {
                const tg = kf.tgs[j];
                if (tg.target.el === target) {
                    kf.tgs.splice(j, 1);
                }
            }
            if (kf.tgs.length === 0) {
                this.keyframes.splice(i, 1);
            }
        }
    }
    reset() {
        this.stop();
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            const tgs = this.keyframes[i].tgs;
            if (this.keyframes[i].initialized) {
                for (let j = 0; j < tgs.length; j++) {
                    Animation._render(tgs, 0, 1);
                }
            }
        }
    }
    stop() {
        this.status = 0;
        this._pos = 0;
        this._currentKf = this.keyframes[0];
        this.currentTime = 0;
        this.runningTime = 0;
        this.playedTimes = 0;
        this._dir = 1;
        this.time = 0;
    }
    play() {
        if (this.status > -1) {
            this.status = 1;
            this.paused = false;
        }
    }
    seek(ms) {
        ms = minMax(ms, 0, this.totalDuration);
        this._seeking = true;
        this._preSeekState = this.status;
        this.status = 0;
        this.reset();
        while (ms >= 0) {
            this.update(10);
            ms -= 10;
        }
        this.status = this._preSeekState;
        this._seeking = false;
    }
    static _getRenderStr(tw, t) {
        let str = "";
        let from = tw.from;
        let to = tw.to;
        if (to.numbers.length === 1 && to.units[0] == null) {
            return from.numbers[0] + t * (to.numbers[0] - from.numbers[0]);
        }
        for (let i = 0; i < to.numbers.length; i++) {
            let nfrom = from.numbers[i];
            let nto = to.numbers[i];
            if (nto != null) {
                let val = nfrom + t * (nto - nfrom);
                if (to.floats[i] === 0)
                    val = ~~val;
                str += val + to.units[i];
            }
            else {
                str += to.strings[i];
            }
        }
        return str;
    }
    static _render(tgs, time, dir) {
        for (let i = 0, k = tgs.length; i < k; i++) {
            const tg = tgs[i];
            let transStr = "";
            let filtersStr = "";
            for (let j = 0, f = tg.tweens.length; j < f; j++) {
                const tween = tg.tweens[j];
                const twType = tween.twType;
                let elapsed = minMax(time - tween.start - tween.delay, 0, tween.duration) / tween.duration;
                if (elapsed === 0 && dir === 1)
                    return;
                let eased = isNaN(elapsed) ? 1 : tween.ease(elapsed);
                tween.from;
                tween.to;
                let tweenable = tween.tweenable;
                let prop = tween.prop;
                switch (twType) {
                    case "transform":
                        if (tween.keepOld) {
                            transStr += tween.oldValue + " ";
                        }
                        else {
                            transStr += Animation._getRenderStr(tween, eased) + " ";
                        }
                        break;
                    case "filter":
                        if (tween.keepOld) {
                            filtersStr += tween.oldValue + " ";
                        }
                        else {
                            filtersStr += Animation._getRenderStr(tween, eased) + " ";
                        }
                        break;
                    case "other":
                    case "obj":
                        tweenable[prop] = Animation._getRenderStr(tween, eased);
                        break;
                }
            }
            if (transStr)
                tg.target.tweenable.transform = transStr;
            if (filtersStr)
                tg.target.tweenable.filter = filtersStr;
        }
    }
    static _getTargets(targets, options) {
        if (typeof targets === "string") {
            targets = document.querySelectorAll(targets);
        }
        let t = [];
        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                let target = new Target(targets[i], options.context);
                target.pos = i;
                t.push(target);
            }
        }
        else if (is.tweenable(targets)) {
            t.push(new Target(targets, options.context));
        }
        else {
            throw (new TypeError("Target type is not valid."));
        }
        return t;
    }
    static _getTweens(target, duration, params, options) {
        const keys = Object.keys(params);
        let tg = new TweenGroup(target);
        for (let i = 0; i < keys.length; i++) {
            let prop = keys[i];
            let val = params[prop];
            if (target.type === "dom" && is.propDual(prop)) {
                let res = unwrapValues(prop, val);
                tg.tweens.push(Animation._getTween(target, res[0].prop, res[0].val, duration, options));
                tg.tweens.push(Animation._getTween(target, res[1].prop, res[1].val, duration, options));
            }
            else {
                let tw = Animation._getTween(target, prop, val, duration, options);
                tg.tweens.push(tw);
            }
        }
        return tg;
    }
    static _getTween(target, prop, val, dur, options) {
        let fromVal;
        let toVal;
        if (target.type === "dom") {
            if (prop === "bg")
                prop = "backgroundColor";
            else if (prop === "x")
                prop = "translateX";
            else if (prop === "y")
                prop = "translateY";
            else if (prop === "hueRotate")
                prop = "hue-rotate";
            else if (prop === "dropShadow")
                prop = "drop-shadow";
        }
        const twType = getTweenType(target.type, prop);
        let optEase = options.ease;
        if (is.array(val)) {
            fromVal = val[0];
            toVal = val[1];
        }
        else if (is.obj(val)) {
            const o = val;
            toVal = o.value != (void 0) ? o.value : val;
            dur = o.duration != (void 0) ? o.duration : dur;
            optEase = o.ease != (void 0) ? o.ease : options.ease;
        }
        else {
            toVal = val;
        }
        let delay = options.delay || 0;
        let tw = new Tween(twType, prop, fromVal, toVal, dur, delay, 0);
        if (twType === "direct") {
            tw.tweenable = target.el;
        }
        else {
            tw.tweenable = target.tweenable;
        }
        if (options.stagger) {
            let del = target.pos * options.stagger;
            tw.start = del;
            tw.totalDuration += del;
        }
        let ease;
        if (optEase) {
            if (is.string(optEase)) {
                let res = optEase.match(/[\w]+|[-\d.]+/g);
                if (res && res.length === 1) {
                    ease = Ease[optEase];
                }
                else if (res && res.length === 2) {
                    let e = Ease[res[0]];
                    if (is.func(e))
                        ease = Ease[res[0]](parseFloat(res[1]));
                }
            }
            else
                ease = optEase;
        }
        tw.ease = ease || Ease.quadInOut;
        tw.propType = getPropType(prop);
        return tw;
    }
    static _initTweens(kf) {
        for (let i = 0; i < kf.tgs.length; i++) {
            const tg = kf.tgs[i];
            let transTweens;
            let transOldTweens;
            let transChecked = false;
            let filterTweens;
            let filterOldTweens;
            let filterChecked = false;
            let oldTweens;
            let newTweens;
            for (let j = 0; j < tg.tweens.length; j++) {
                const tw = tg.tweens[j];
                let from;
                let to = getVo(tg.target.type, tw.prop, tw.toVal);
                if (tg.target.type === "dom") {
                    switch (tw.twType) {
                        case "other":
                        case "direct":
                            if (tw.fromVal)
                                from = getVo(tg.target.type, tw.prop, tw.fromVal);
                            else
                                from = getVo(tg.target.type, tw.prop, tg.target.getExistingValue(tw.prop));
                            break;
                        case "transform":
                        case "filter":
                            if (tw.twType === "transform" && !transChecked) {
                                transOldTweens = strToMap(tg.target.getExistingValue("transform"), "transform");
                                transTweens = new Map();
                                transChecked = true;
                                oldTweens = transOldTweens;
                                newTweens = transTweens;
                            }
                            else if (tw.twType === "filter" && !filterChecked) {
                                filterOldTweens = strToMap(tg.target.getExistingValue("filter"), "filter");
                                filterTweens = new Map();
                                filterChecked = true;
                                oldTweens = filterOldTweens;
                                newTweens = filterTweens;
                            }
                            if (tw.fromVal) {
                                from = getVo("dom", tw.prop, tw.fromVal);
                            }
                            else {
                                if (oldTweens && oldTweens.has(tw.prop)) {
                                    from = oldTweens.get(tw.prop).from;
                                    tw.keepOld = false;
                                }
                                else {
                                    from = from = getVo("dom", tw.prop, tw.fromVal);
                                }
                            }
                            newTweens.set(tw.prop, tw);
                            break;
                    }
                }
                else {
                    if (!tw.fromVal)
                        tw.fromVal = tg.target.getExistingValue(tw.prop);
                    from = getVo("obj", tw.prop, tw.fromVal);
                }
                tw.from = from;
                tw.to = to;
                normalizeTween(tw, tg.target);
            }
            if (transOldTweens)
                Animation._arrangeMaps(transOldTweens, transTweens, tg, "transform");
            if (filterOldTweens)
                Animation._arrangeMaps(filterOldTweens, filterTweens, tg, "filter");
        }
    }
    static _arrangeMaps(oldM, newM, tg, prop) {
        newM.forEach((v, k) => {
            oldM.set(k, v);
        });
        for (let j = tg.tweens.length - 1; j >= 0; j--) {
            if (tg.tweens[j].twType === prop) {
                tg.tweens.splice(j, 1);
            }
        }
        oldM.forEach((v) => {
            tg.tweens.push(v);
        });
    }
}

class Glide {
    static to(targets, duration, params, options = {}) {
        if (!Glide.context && document)
            Glide.setContext(document.body);
        options.context = options.context ? new Context(options.context) : Glide.context;
        options.computeStyle = options.computeStyle !== (void 0) ? options.computeStyle : Glide._computeStyle;
        let a = new Animation(targets, duration, params, options);
        Glide.items.push(a);
        return a;
    }
    static tick(t) {
        let delta = t - Glide.lastTick;
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            let item = Glide.items[i];
            if (item.status === 1) {
                item.update(delta);
            }
            else if (item.status === -1) {
                Glide.items.splice(i, 1);
            }
        }
        Glide.lastTick = t;
        requestAnimationFrame(Glide.tick);
    }
    static setContext(parent) {
        Glide.context = new Context(parent);
    }
}
Glide.items = [];
Glide.lastTick = 0;
Glide.ease = ease;
Glide._computeStyle = true;
Glide.tick(performance.now());
const glide = Glide;

export default glide;
