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
            turn: 1,
            deg: 1 / 360,
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
            if (key !== "turn" && key !== "deg" && key !== "rad") {
                el.style.width = 1 + key;
                this.units[key] = parseFloat(computed.width);
            }
        }
        p.removeChild(el);
    }
    static convertUnits(val, from, to, units) {
        let px = units[from];
        let un = units[to];
        return px / un * val;
    }
}

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
    valDual(val) {
        return (/translate\(|scale\(|skew\(/i.test(val));
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
        this.strBegin = "";
        this.keepOriginal = false;
        this.keepStr = "";
        this.diffVals = [];
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
function getVo(targetType, prop, val) {
    let vo = new Vo();
    vo.targetType = targetType;
    vo.tweenType = getTweenType(targetType, prop);
    vo.prop = prop;
    switch (vo.tweenType) {
        case "css":
        case "transform":
            let vus = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.values.push(vus[i].value);
                vo.units.push(vus[i].unit);
                vo.increments.push(vus[i].increment);
            }
            break;
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
function transStrToMap(str) {
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
        res.set(vo.prop, vo);
    }
    return res;
}

class Keyframe {
    constructor() {
        this.duration = 0;
        this.totalDuration = 0;
        this.tweens = [];
        this.initialized = false;
    }
    push(...t) {
        for (let i = 0; i < t.length; i++) {
            if (this.totalDuration < t[i].totalDuration)
                this.totalDuration = t[i].totalDuration;
            this.tweens.push(t[i]);
        }
    }
}

function quadInOut(t = 0.0) {
    if (t < 0.5)
        return 2.0 * t * t;
    else
        return -1.0 + (4.0 - 2.0 * t) * t;
}

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
        this.tweenable = target.tweenable;
        this.targetType = target.type;
        this.type = twType;
        this.prop = prop;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.duration = duration;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay;
    }
}

const progress = "progress";
const end = "end";
const Evt = {
    progress: progress,
    end: end,
};

class G extends Dispatcher {
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
        this.repeat = (options.repeat !== (void 0) && options.repeat > 0) ? options.repeat + 1 : 1;
        this.targets = G._getTargets(targets, options);
        this.to(duration, params, options);
    }
    to(duration, params, options = {}) {
        let kf = new Keyframe();
        for (let i = 0; i < this.targets.length; i++) {
            const tweens = G._getTweens(this.targets[i], duration, params, options);
            kf.push(...tweens);
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
            G._initTweens(this.currentKf);
            this.currentKf.initialized = true;
        }
        this.time += t * this.dir;
        this.currentTime += t;
        let tws = this.currentKf.tweens;
        for (let i = 0; i < tws.length; i++) {
            const tween = tws[i];
            const twType = tween.type;
            let elapsed = minMax(this.time - tween.start - tween.delay, 0, tween.duration) / tween.duration;
            let eased = isNaN(elapsed) ? 1 : tween.ease(elapsed);
            let from = tween.from;
            let to = tween.to;
            let tweenable = tween.tweenable;
            let prop = tween.prop;
            switch (twType) {
                case "css":
                    let str = "";
                    for (let j = 0; j < from.values.length; j++) {
                        let val = from.values[j] + eased * (to.values[j] - tween.from.values[j]);
                        str += `${val}${to.units[j]} `;
                    }
                    tweenable[prop] = str;
                    break;
                case "color":
                    let r = ~~(from.values[0] + eased * to.diffVals[0]);
                    let g = ~~(from.values[1] + eased * to.diffVals[1]);
                    let b = ~~(from.values[2] + eased * to.diffVals[2]);
                    let a = (from.values.length === 4) ? ", " + (from.values[3] + eased * to.diffVals[3]) : "";
                    tweenable[prop] = `${to.strBegin}(${r}, ${g}, ${b}${a})`;
                    break;
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
                    this.dispatch(Evt.end, null);
                }
            }
            this.currentTime = 0;
        }
    }
    reset() {
    }
    static _getTargets(targets, options) {
        if (typeof targets === "string") {
            targets = document.querySelectorAll(targets);
        }
        let t = [];
        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                t.push(new Target(targets[i], options.context));
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
        let arr = [];
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            let prop = keys[i];
            let val = params[prop];
            let dur = duration;
            let fromVal;
            let toVal;
            const twType = getTweenType(target.type, prop);
            if (is.array(val)) {
                fromVal = val[0];
                toVal = val[1];
            }
            else if (is.obj(val)) {
                const o = val;
                dur = o.duration;
                toVal = o.value;
            }
            else {
                toVal = val;
            }
            let delay = options.delay || 0;
            let tw = new Tween(target, twType, prop, fromVal, toVal, dur, delay, 0);
            arr.push(tw);
        }
        return arr;
    }
    static _initTweens(kf) {
        let transOldMap;
        let transChecked = false;
        for (let i = 0; i < kf.tweens.length; i++) {
            const tw = kf.tweens[i];
            let vFrom = tw.fromVal ? tw.fromVal : tw.target.getExistingValue(tw.prop);
            let from;
            let to = getVo(tw.targetType, tw.prop, tw.toVal);
            if (tw.target.type === "dom") {
                switch (tw.type) {
                    case "css":
                        from = getVo(tw.targetType, tw.prop, vFrom);
                        break;
                    case "transform":
                        if (!transChecked) {
                            transOldMap = transStrToMap(tw.target.getExistingValue("transform"));
                            transChecked = true;
                        }
                        if (transOldMap) ;
                        else {
                            from = getVo("dom", tw.prop, null);
                        }
                        console.log(transOldMap);
                        break;
                }
            }
            tw.from = from;
            tw.to = to;
            normalizeVos(from, to, tw.target.context);
        }
    }
}

class Glide {
    static to(targets, duration, params, options = {}) {
        if (!Glide.context && document)
            Glide.setContext(document.body);
        options.context = options.context ? new Context(options.context) : Glide.context;
        options.computeStyle = options.computeStyle !== (void 0) ? options.computeStyle : Glide._computeStyle;
        let a = new G(targets, duration, params, options);
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
Glide._computeStyle = true;
Glide.tick(performance.now());
const glide = Glide;

export default glide;
