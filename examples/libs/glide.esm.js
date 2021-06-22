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
        el.style.position = "relative";
        el.style.visibility = "invisible";
        el.style.width = "1px";
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
const regVUs = /[-+=.\w%]+/g;
const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
const regColorVal = /([rgbahsl]+\([,%a-z \d.-]+\))|#[0-9A-F]{6}/gi;
const regProp = /^[-\w]+[^( ]/gi;
const regTypes = /Null|Number|String|Object|Array/g;
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
        this.target = target;
        this.context = context;
        this.init();
    }
    init() {
        this.type = is.dom(this.target) ? "dom" : "obj";
        if (this.type === "dom") {
            this.style = this.target.style;
            this.tweenable = this.style;
            this.computedStyle = window.getComputedStyle(this.target);
        }
        else {
            this.tweenable = this.target;
        }
    }
    getExistingValue(prop) {
        let res;
        if (this.type === "obj" || is.propDirect(prop)) {
            return this.target[prop];
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
            this.target[prop] = val;
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
        this.targetType = "dom";
        this.tweenType = "css";
        this.prop = "";
        this.values = [];
        this.units = [];
        this.increments = [];
        this.isNumber = false;
        this.strBegin = "";
        this.keepOriginal = false;
        this.keepStr = "";
        this.diffVals = [];
    }
}
class TweenGroup {
    constructor(target) {
        this.target = null;
        this.tweenable = null;
        this.type = "dom";
        this.tweens = [];
        this.target = target;
        this.tweenable = target.tweenable;
        this.type = target.type;
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
    constructor(target, twType, prop, fromVal, toVal, duration, delay, start) {
        this.tweenable = null;
        this.type = null;
        this.targetType = null;
        this.prop = "";
        this.duration = 0.0;
        this.delay = 0.0;
        this.start = 0.0;
        this.totalDuration = 0.0;
        this.fromVal = null;
        this.toVal = null;
        this.from = null;
        this.to = null;
        this.computed = null;
        this.ease = quadInOut;
        this.initialized = false;
        this.target = target;
        this.tweenable = target === null || target === void 0 ? void 0 : target.tweenable;
        this.targetType = target === null || target === void 0 ? void 0 : target.type;
        this.type = twType;
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
    if (is.obj(targetType))
        return "obj";
    else if (is.propTransform(prop))
        return "transform";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propColor(prop))
        return "color";
    else if (is.propDirect(prop))
        return "direct";
    return "css";
}
function getValueType(val = null) {
    let t = getObjType(val).match(regTypes)[0];
    switch (t) {
        case "Null":
            return "null";
        case "Number":
            return "number";
        case "String":
            return "string";
    }
    return;
}
function getPropType(prop) {
    if (is.propDropShadow(prop))
        return "dropShadow";
    else if (is.propColor(prop))
        return "color";
    else if (is.propMatrix(prop))
        return "matrix";
    return "other";
}
function getDefaultUnit(prop) {
    if (is.unitDegrees(prop))
        return "deg";
    else if (is.unitPercent(prop))
        return "%";
    else if (is.unitless(prop))
        return "";
    return "px";
}
function getValueUnit(val) {
    const increment = val.match(/-=|\+=|\*=|\/=/g);
    if (increment)
        increment[0] = increment[0].replace("=", "");
    val = val.replace("-=", "");
    const v = val.match(/[-.\d]+|[%\w]+/g);
    if (v.length === 1)
        v.push(null);
    return {
        value: parseFloat(v[0]),
        unit: v.length === 1 ? "" : v[1],
        increment: increment ? increment[0] : null
    };
}
function getValuesUnits(val) {
    let vus = [];
    let vtype = getValueType(val);
    if (vtype === "null") {
        return [{
                value: 0,
                unit: null,
                increment: null
            }];
    }
    else if (vtype === "number") {
        return [{
                value: val,
                unit: null,
                increment: null
            }];
    }
    let arr = val.match(regVUs);
    for (let i = 0; i < arr.length; i++) {
        vus.push(getValueUnit(arr[i]));
    }
    return vus;
}
function getNumbers(val) {
    let nums = val.match(/[-.\d]+/g);
    return nums.map((v) => parseFloat(v));
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
function getVo(targetType, prop, val) {
    let vo = new Vo();
    vo.targetType = targetType;
    vo.tweenType = getTweenType(targetType, prop);
    vo.prop = prop;
    vo.isNumber = targetType === "obj";
    let propType = getPropType(prop);
    if (targetType === "dom" && is.valueOne(prop)) {
        if (val == void 0)
            val = 1;
    }
    switch (propType) {
        case "color":
            let colorMatch = val.match(regColorVal);
            let color;
            if (colorMatch) {
                color = toRgbStr(colorMatch[0]);
                val = val.replace(colorMatch[0], color);
            }
            vo.values = getNumbers(val);
            for (let i = 0; i < vo.values.length; i++) {
                vo.units.push("");
            }
            vo.strBegin = vo.values.length === 4 ? "rgba" : "rgb";
            break;
        case "dropShadow":
            if (!val)
                val = "0px 0px 0px #cccccc";
            let rgb = val.match(regColorVal)[0];
            val = val.replace(rgb, "");
            let pa = getValuesUnits(val);
            for (let i = 0; i < pa.length; i++) {
                vo.values.push(pa[i].value);
                vo.units.push(pa[i].unit);
                vo.increments.push(pa[i].increment);
            }
            let rgbs = toRgb(rgb);
            vo.values = vo.values.concat(...rgbs);
            break;
        case "matrix":
            if (!val) {
                vo.values = [1, 0, 0, 1, 0, 0];
                vo.units = ["", "", "", "", "", ""];
            }
            else {
                vo.values = getNumbers(val);
                vo.units = ["", "", "", "", "", ""];
            }
            break;
        case "other":
            let vus = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.values.push(vus[i].value);
                let unit = targetType === "dom" ? vus[i].unit : null;
                vo.units.push(unit);
                vo.increments.push(vus[i].increment);
            }
    }
    return vo;
}
function getVoFromStr(str) {
    let prop = str.match(regProp)[0];
    str = str.replace(prop, "");
    return getVo("dom", prop, str);
}
function normalizeVos(from, to, context) {
    const prop = from.prop;
    if (prop === "drop-shadow") {
        if (from.values.length > to.values.length)
            to.values.push(1);
        else if (from.values.length < to.values.length)
            from.values.push(1);
    }
    if (to.units.length > from.units.length) {
        let diff = to.units.length - from.units.length;
        for (let i = 0; i < diff; i++) {
            from.units.push(null);
            let v = is.valueOne(to.prop) ? 1 : 0;
            from.values.push(v);
        }
    }
    for (let i = 0; i < from.units.length; i++) {
        let uFrom = from.units[i];
        let uTo = to.units[i];
        let incr = to.increments[i];
        if (!from.isNumber) {
            if (!uFrom)
                uFrom = from.units[i] = getDefaultUnit(from.prop);
            if (!uTo)
                uTo = to.units[i] = uFrom;
            if (uFrom && uFrom !== uTo) {
                if (is.propTransform(from.prop) && (uFrom === "%" && uTo !== "%" || uFrom !== "%" && uTo === "%")) ;
                else {
                    from.values[i] = Context.convertUnits(from.values[i], uFrom, uTo, context.units);
                }
            }
        }
        if (incr === "-") {
            to.values[i] = from.values[i] - to.values[i];
        }
        else if (incr === "+") {
            to.values[i] += from.values[i];
        }
        else if (incr === "*") {
            to.values[i] *= from.values[i];
        }
        else if (incr === "/") {
            to.values[i] /= from.values[i];
        }
        to.diffVals.push(to.values[i] - from.values[i]);
    }
}
function strToMap(str) {
    let res = new Map();
    if (!str || str === "" || str === "none")
        return null;
    let arr = str.match(regStrValues);
    if (!arr)
        return null;
    for (let i = 0; i < arr.length; i++) {
        let part = arr[i];
        let vo = getVoFromStr(part);
        vo.keepOriginal = true;
        vo.keepStr = part;
        if (is.propDual(vo.prop)) {
            let prop = part.match(regProp)[0];
            let propX = prop + "X";
            let propY = prop + "Y";
            let part2 = part.replace(prop, "");
            let vus = part2.match(regValues);
            if (vus.length === 1)
                vus.push(is.valueOne(prop) ? "1" : "0");
            let vox = getVo("dom", propX, vus[0]);
            vox.keepOriginal = true;
            vox.keepStr = `${propX}(${vus[0]})`;
            let voy = getVo("dom", propY, vus[1]);
            voy.keepOriginal = true;
            voy.keepStr = `${propY}(${vus[1]})`;
            let twx = new Tween(null, "transform", propX, null, null, 0, 0, 0);
            twx.from = vox;
            res.set(propX, twx);
            let twy = new Tween(null, "transform", propY, null, null, 0, 0, 0);
            twy.from = voy;
            res.set(propY, twy);
        }
        else {
            let tw = new Tween(null, "transform", vo.prop, null, null, 0, 0, 0);
            tw.from = vo;
            res.set(vo.prop, tw);
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
        this.seeking = false;
        this.dir = 1;
        this.time = 0.0;
        this.totalDuration = 0.0;
        this.currentTime = 0.0;
        this.playedTimes = 0;
        this.loop = true;
        this.repeat = 1;
        this.num = 0;
        this.repeat = (options.repeat != (void 0) && options.repeat > 0) ? options.repeat + 1 : 1;
        this.loop = options.loop != (void 0) ? options.loop : true;
        this.targets = Animation._getTargets(targets, options);
        this.to(duration, params, options);
    }
    to(duration, params, options = {}) {
        let kf = new Keyframe();
        for (let i = 0; i < this.targets.length; i++) {
            const tg = Animation._getTweens(this.targets[i], duration, params, options);
            kf.push(tg);
        }
        this.totalDuration += kf.totalDuration * this.repeat;
        this.keyframes.push(kf);
        if (!this.currentKf) {
            this.currentKf = kf;
        }
        return this;
    }
    update(t) {
        if ((this.paused && !this.seeking) || this.status === 0)
            return;
        if (!this.currentKf.initialized) {
            Animation._initTweens(this.currentKf);
            this.currentKf.initialized = true;
        }
        this.time += t * this.dir;
        this.currentTime += t;
        const tgs = this.currentKf.tgs;
        for (let i = 0; i < tgs.length; i++) {
            const tg = tgs[i];
            const tweenable = tg.tweenable;
            let transformsStr = "";
            let filtersStr = "";
            for (let j = 0; j < tg.tweens.length; j++) {
                const tween = tg.tweens[j];
                const twType = tween.type;
                let elapsed = minMax(this.time - tween.start - tween.delay, 0, tween.duration) / tween.duration;
                if (elapsed === 0 && this.dir === 1)
                    return;
                let eased = isNaN(elapsed) ? 1 : tween.ease(elapsed);
                let from = tween.from;
                let to = tween.to;
                let tweenable = tween.tweenable;
                let prop = tween.prop;
                const isNum = from.isNumber;
                switch (twType) {
                    case "css":
                        if (isNum) {
                            tweenable[prop] = from.values[0] + eased * (to.values[0] - tween.from.values[0]);
                        }
                        else {
                            let str = "";
                            for (let j = 0; j < from.values.length; j++) {
                                let val = from.values[j] + eased * (to.values[j] - tween.from.values[j]);
                                str += `${val}${to.units[j]} `;
                            }
                            tweenable[prop] = str;
                        }
                        break;
                    case "color":
                        let r = ~~(from.values[0] + eased * to.diffVals[0]);
                        let g = ~~(from.values[1] + eased * to.diffVals[1]);
                        let b = ~~(from.values[2] + eased * to.diffVals[2]);
                        let a = (from.values.length === 4) ? ", " + (from.values[3] + eased * to.diffVals[3]) : "";
                        tweenable[prop] = `${to.strBegin}(${r}, ${g}, ${b}${a})`;
                        break;
                    case "transform":
                        if (from.keepOriginal) {
                            transformsStr += from.keepStr + " ";
                        }
                        else {
                            transformsStr += `${to.prop}(`;
                            for (let j = 0; j < from.values.length; j++) {
                                let val = from.values[j] + eased * (to.values[j] - tween.from.values[j]);
                                let sep = j < to.values.length - 1 ? ", " : "";
                                transformsStr += `${val}${to.units[j]}${sep}`;
                            }
                            transformsStr += ") ";
                        }
                        break;
                    case "filter":
                        if (prop === "drop-shadow" && !from.keepOriginal) {
                            let x = from.values[0] + eased * to.diffVals[0];
                            let y = from.values[1] + eased * to.diffVals[1];
                            let brad = from.values[2] + eased * to.diffVals[2];
                            let r = ~~(from.values[3] + eased * to.diffVals[3]);
                            let g = ~~(from.values[4] + eased * to.diffVals[4]);
                            let b = ~~(from.values[5] + eased * to.diffVals[5]);
                            let a = (from.values.length === 7) ? ", " + (from.values[6] + eased * (to.values[6] - from.values[6])) : "";
                            let pref = (from.values.length === 7) ? "rgba" : "rgb";
                            filtersStr += `drop-shadow(${x}${to.units[0]} ${y}${to.units[1]} ${brad}${to.units[2]} `;
                            filtersStr += `${pref}(${r}, ${g}, ${b}${a}))`;
                        }
                        else if (from.keepOriginal) {
                            filtersStr += from.keepStr + " ";
                        }
                        else {
                            let v = from.values[0] + eased * to.diffVals[0];
                            filtersStr += `${to.prop}(${v}${to.units[0]}) `;
                        }
                        break;
                    case "direct":
                        tweenable[prop] = from.values[0] + eased * to.diffVals[0];
                        break;
                }
            }
            if (transformsStr) {
                tweenable.transform = transformsStr;
            }
            if (filtersStr) {
                tweenable.filter = filtersStr;
            }
        }
        this.dispatch(Evt.progress, null);
        if (this.currentTime >= this.currentKf.totalDuration) {
            if (this.dir > 0 && this.keyframes.length > this.num + 1) {
                this.num++;
                this.time = 0;
                this.currentKf = this.keyframes[this.num];
            }
            else if (this.dir < 0 && this.num > 0) {
                this.num--;
                this.currentKf = this.keyframes[this.num];
                this.time = this.currentKf.totalDuration;
            }
            else {
                this.playedTimes++;
                if (this.playedTimes < this.repeat) {
                    if (this.loop) {
                        this.dir *= -1;
                    }
                    else {
                        this.reset();
                        this.currentKf = this.keyframes[0];
                    }
                }
                else {
                    this.status = 0;
                    this.targets = [];
                    this.dispatch(Evt.end, null);
                }
            }
            this.currentTime = 0;
        }
    }
    reset() {
        this.time = 0;
        this.num = 0;
    }
    remove(target) {
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            let kf = this.keyframes[i];
            for (let j = kf.tgs.length - 1; j >= 0; j--) {
                const tg = kf.tgs[j];
                if (tg.target.target === target) {
                    kf.tgs.splice(j, 1);
                }
            }
            if (kf.tgs.length === 0) {
                this.keyframes.splice(i, 1);
            }
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
        let optEase;
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
        let tw = new Tween(target, twType, prop, fromVal, toVal, dur, delay, 0);
        if (twType === "direct")
            tw.tweenable = target.target;
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
                let to = getVo(tw.targetType, tw.prop, tw.toVal);
                if (tw.target.type === "dom") {
                    switch (tw.type) {
                        case "css":
                        case "color":
                        case "direct":
                            if (tw.fromVal)
                                from = getVo(tw.targetType, tw.prop, tw.fromVal);
                            else
                                from = getVo(tw.targetType, tw.prop, tw.target.getExistingValue(tw.prop));
                            break;
                        case "transform":
                        case "filter":
                            if (tw.type === "transform" && !transChecked) {
                                transOldTweens = strToMap(tw.target.getExistingValue("transform"));
                                transTweens = new Map();
                                transChecked = true;
                                oldTweens = transOldTweens;
                                newTweens = transTweens;
                            }
                            else if (tw.type === "filter" && !filterChecked) {
                                filterOldTweens = strToMap(tw.target.getExistingValue("filter"));
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
                                    from.keepOriginal = false;
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
                        tw.fromVal = tw.target.getExistingValue(tw.prop);
                    from = getVo("obj", tw.prop, tw.fromVal);
                }
                tw.from = from;
                tw.to = to;
                normalizeVos(from, to, tw.target.context);
            }
            if (transOldTweens) {
                transTweens.forEach((v, k) => {
                    transOldTweens.set(k, v);
                });
                for (let j = tg.tweens.length - 1; j >= 0; j--) {
                    if (tg.tweens[j].type === "transform") {
                        tg.tweens.splice(j, 1);
                    }
                }
                transOldTweens.forEach((v) => {
                    tg.tweens.push(v);
                });
            }
        }
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
            else if (item.status === 0) {
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
