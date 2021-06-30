import Target from "./target";
import Dispatcher from "./dispatcher";
import { getPropType, getTweenType, getVo, minMax, normalizeTween, strToMap, unwrapValues } from "../util/util";
import { Keyframe } from "./keyframe";
import { Tween } from "./tween";
import { Evt } from "./events";
import { TweenGroup } from "./vo";
import { is } from "../util/regex";
import * as $Ease from "../util/ease";
const Ease = $Ease;
export class Animation extends Dispatcher {
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
        if (duration !== void 0) {
            this.repeat = (options.repeat != (void 0) && options.repeat > 0) ? options.repeat + 1 : 1;
            this.loop = options.loop != (void 0) ? options.loop : true;
            this.paused = options.paused != (void 0) ? options.paused : false;
            this.keep = options.keep != (void 0) ? options.keep : false;
        }
        else {
            this.status = 0;
        }
        this.target(targets, options);
        if (duration !== void 0)
            this.to(duration, params, options);
    }
    target(targets, options) {
        this.targets = Animation._getTargets(targets, options);
        return this;
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
        if (this.status === 0)
            this.status = 1;
        return this;
    }
    set(params) {
        let kf = new Keyframe();
        for (let i = 0; i < this.targets.length; i++) {
            const tg = Animation._getTweens(this.targets[i], 0, params, {});
            kf.push(tg);
            Animation._initTweens(kf);
            Animation._render(kf.tgs, 1, 1);
        }
        return this;
    }
    update(t) {
        if ((this.paused && !this._seeking) || this.status < 1)
            return;
        if (!this._currentKf.initialized) {
            Animation._initTweens(this._currentKf);
            this._currentKf.initialized = true;
        }
        this.time += t * this._dir;
        this.currentTime += t;
        this.runningTime += t;
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
    static _getPathStr(tw, t) {
        const vo = tw.to;
        const path = vo.path;
        const box = vo.bBox;
        const pos = path.getPointAtLength(vo.len * t);
        const p0 = path.getPointAtLength(vo.len * (t - 0.01));
        const p1 = path.getPointAtLength(vo.len * (t + 0.01));
        let rot = 0;
        let rotStr = "";
        let deg = "";
        if (tw.orientToPath) {
            rot = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
            rotStr = ` rotate(${rot})`;
            deg = "deg";
        }
        let x, y;
        if (is.svg(tw.tweenable)) {
            x = pos.x - vo.bBox.x;
            y = pos.y - vo.bBox.y;
            tw.tweenable.setAttribute("transform", `translate(${x}, ${y})${rotStr}`);
        }
        else {
            let screenPt = pos.matrixTransform(vo.svg.getScreenCTM());
            let offsetX = box.x - vo.offsetX;
            let offsetY = box.y - vo.offsetY;
            tw.tweenable.transform = `translate(${screenPt.x - offsetX}px, ${screenPt.y - offsetY}px) rotate(${rot}${deg})`;
        }
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
                let from = tween.from;
                let to = tween.to;
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
                    case "direct":
                        tweenable[prop] = from.numbers[0] + eased * (to.numbers[i] - from.numbers[i]);
                        break;
                    case "svg":
                        tweenable.setAttribute(prop, Animation._getRenderStr(tween, eased));
                        break;
                    case "path":
                        Animation._getPathStr(tween, eased);
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
        if (is.string(targets)) {
            targets = document.querySelectorAll(targets);
        }
        let t = [];
        if (is.list(targets)) {
            let staggerTime = 0;
            for (let i = 0; i < targets.length; i++) {
                let targ;
                if (is.string(targets[i]))
                    targ = document.querySelector(targets[i]);
                else
                    targ = targets[i];
                let target = new Target(targ, options.context);
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
        tw.options = options;
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
                let to = getVo(tg.target, tw.prop, tw.toVal, tw.options);
                if (tg.target.type === "dom") {
                    switch (tw.twType) {
                        case "other":
                        case "direct":
                            if (tw.fromVal)
                                from = getVo(tg.target, tw.prop, tw.fromVal);
                            else
                                from = getVo(tg.target, tw.prop, tg.target.getExistingValue(tw.prop));
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
                                from = getVo(tg.target, tw.prop, tw.fromVal);
                            }
                            else {
                                if (oldTweens && oldTweens.has(tw.prop)) {
                                    from = oldTweens.get(tw.prop).from;
                                    tw.keepOld = false;
                                }
                                else {
                                    from = from = getVo(tg.target, tw.prop, tw.fromVal);
                                }
                            }
                            newTweens.set(tw.prop, tw);
                            break;
                    }
                }
                else {
                    if (!tw.fromVal)
                        tw.fromVal = tg.target.getExistingValue(tw.prop);
                    from = getVo(tg.target, tw.prop, tw.fromVal);
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
