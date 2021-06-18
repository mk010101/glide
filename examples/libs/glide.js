(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.glide = factory());
}(this, (function () { 'use strict';

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
            return (/scale|opacity/i.test(val));
        },
    };
    function getTweenType(targetType, prop) {
        if (is.obj(targetType))
            return "obj";
        else if (is.propTransform(prop))
            return "transform";
        else if (is.propFilter(prop))
            return "filter";
        else if (is.propDirect(prop))
            return "direct";
        return "css";
    }

    class Target {
        constructor(target, context) {
            this.target = target;
            this.context = context;
            this.init();
        }
        init() {
            this.type = is.dom(this.target) ? "dom" : "obj";
            if (this.type === "dom") {
                this.inlineStyle = this.target.style;
                this.computedStyle = window.getComputedStyle(this.target);
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
            if (this.inlineStyle) {
                res = this.inlineStyle[prop];
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
                this.inlineStyle[prop] = val;
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

    class Keyframe {
        constructor() {
            this.duration = 0;
            this.totalDuration = 0;
        }
    }

    function quadInOut(t = 0.0) {
        if (t < 0.5)
            return 2.0 * t * t;
        else
            return -1.0 + (4.0 - 2.0 * t) * t;
    }

    class Tween {
        constructor(target, type, prop, duration) {
            this.target = null;
            this.type = null;
            this.prop = "";
            this.duration = 0.0;
            this.from = null;
            this.to = null;
            this.computed = null;
            this.ease = quadInOut;
            this.target = target;
            this.prop = prop;
            this.duration = duration;
        }
    }

    class G extends Dispatcher {
        constructor(targets, duration, params, options = {}) {
            super();
            this.status = 1;
            this.targets = [];
            this.keyframes = [];
            this.targets = G._getTargets(targets, options);
            this.to(duration, params, options);
        }
        to(duration, params, options = {}) {
            let kf = new Keyframe();
            for (let i = 0; i < this.targets.length; i++) {
                G.getTweens(this.targets[i], duration, params, options);
            }
            this.keyframes.push(kf);
            return this;
        }
        update(delta) {
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
        static getTweens(target, duration, params, options) {
            const keys = Object.keys(params);
            for (let i = 0; i < keys.length; i++) {
                let prop = keys[i];
                params[prop];
                const twType = getTweenType(target.type, prop);
                let tw = new Tween(target.target, twType, prop, duration);
                console.log(tw);
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

    return glide;

})));
