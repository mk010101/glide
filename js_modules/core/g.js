import Target from "./target";
import Dispatcher from "./dispatcher";
import { getTweenType, getVo, is, minMax, normalizeVos } from "../util/util";
import { Keyframe } from "./keyframe";
import { Tween } from "./tween";
import { Evt } from "./events";
export class G extends Dispatcher {
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
            switch (twType) {
                case "css":
                    let str = "";
                    for (let j = 0; j < from.values.length; j++) {
                        let val = from.values[j] + eased * (to.values[j] - tween.from.values[j]);
                        str += `${val}${to.units[j]} `;
                    }
                    tween.target[tween.prop] = str;
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
            if (is.obj(val)) {
                const o = val;
                dur = o.duration;
                val = o.value;
            }
            const twType = getTweenType(target.type, prop);
            let delay = options.delay || 0;
            let tw = new Tween(target.tweenable, twType, prop, dur, delay, 0);
            let from = getVo(target.type, prop, target.getExistingValue(prop));
            let to = getVo(target.type, prop, val);
            normalizeVos(from, to, target.context);
            tw.from = from;
            tw.to = to;
            arr.push(tw);
        }
        return arr;
    }
}
