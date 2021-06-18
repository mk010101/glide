import Target from "./target";
import Dispatcher from "./dispatcher";
import {getTweenType, getVo, minMax, normalizeVos, transStrToMap} from "../util/util";
import {Keyframe} from "./keyframe";
import {Tween} from "./tween";
import {Evt} from "./events";
import {Value} from "../types";
import {Vo} from "./vo";
import {is} from "../util/regex";

export class G extends Dispatcher {

    status = 1;
    targets: Target[] = [];
    keyframes: Keyframe[] = [];
    currentKf: Keyframe;
    paused = false;
    seeking = false;
    dir = 1;
    time = 0.0;
    // duration = 0.0;
    totalDuration = 0.0;
    currentTime = 0.0;
    playedTimes = 0;
    loop = true;
    repeat = 1;

    num: number = 0;

    constructor(targets: any, duration: number, params: any, options: any = {}) {
        super();

        this.repeat = (options.repeat !== (void 0) && options.repeat > 0) ? options.repeat + 1 : 1;

        this.targets = G._getTargets(targets, options);
        this.to(duration, params, options);

    }


    to(duration: number, params: any, options: any = {}) {

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


    update(t: number) {

        if ((this.paused && !this.seeking) || this.status === 0) return;

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
            let from: Vo = tween.from;
            let to: Vo = tween.to;
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

            //tween.target[tween.prop] = tween.from.values[0] + eased * (tween.to.values[0] - tween.from.values[0]);

        }


        this.dispatch(Evt.progress, null);

        if (this.currentTime >= this.currentKf.totalDuration) {

            if (this.dir > 0 && this.keyframes.length > this.num + 1) {
                this.num++;
                this.time = 0;
                this.currentKf = this.keyframes[this.num];
            } else if (this.dir < 0 && this.num > 0) {
                this.num--;
                this.currentKf = this.keyframes[this.num];
                this.time = this.currentKf.totalDuration;
            } else {
                this.playedTimes++;
                if (this.playedTimes < this.repeat) {
                    if (this.loop) {
                        this.dir *= -1;
                    } else {
                        this.reset();
                        this.currentKf = this.keyframes[0];
                    }
                } else {
                    this.status = 0;
                    this.dispatch(Evt.end, null);
                }
            }

            this.currentTime = 0;

        }

    }

    reset() {

    }


    static _getTargets(targets: any, options: any): Target[] {
        if (typeof targets === "string") {
            targets = document.querySelectorAll(targets);
        }

        let t: Target[] = [];

        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                t.push(new Target(targets[i], options.context));
            }
        } else if (is.tweenable(targets)) {
            t.push(new Target(targets, options.context));
        } else {
            throw (new TypeError("Target type is not valid."));
        }
        return t;
    }

    static _getTweens(target: Target, duration: number, params: any, options: any): Tween[] {
        let arr: Tween[] = [];
        const keys = Object.keys(params);


        for (let i = 0; i < keys.length; i++) {

            let prop: any = keys[i];
            let val: any = params[prop];
            let dur = duration;

            let fromVal: any;
            let toVal: any;

            const twType = getTweenType(target.type, prop);

            if (is.array(val)) {
                fromVal = val[0];
                toVal = val[1];
            } else if (is.obj(val)) {
                const o: Value = val;
                dur = o.duration;
                toVal = o.value;
            } else {
                toVal = val;
            }


            let delay = options.delay || 0;
            let tw = new Tween(target, twType, prop, fromVal, toVal, dur, delay, 0);
            arr.push(tw);


        }
        return arr;

    }

    static _initTweens(kf: Keyframe) {

        let transMap: Map<string, Vo>;
        let transOldMap: Map<string, Vo>;
        let transChecked = false;

        for (let i = 0; i < kf.tweens.length; i++) {
            const tw = kf.tweens[i];

            let vFrom = tw.fromVal ? tw.fromVal : tw.target.getExistingValue(tw.prop);
            let from:Vo;
            let to:Vo = getVo(tw.targetType, tw.prop, tw.toVal);
            //normalizeVos(from, to, tw.target.context);
            //tw.from = from;
            //tw.to = to;

            if (tw.target.type === "dom") {

                switch (tw.type) {

                    case "css":
                        from = getVo(tw.targetType, tw.prop, vFrom);
                        break;

                    case "transform":

                        if (!transChecked) {
                            transOldMap = transStrToMap(tw.target.getExistingValue("transform"));
                            transMap = new Map<string, Vo>();
                            transChecked = true;
                        }

                        if (transOldMap) {

                        } else {
                            from = getVo("dom", tw.prop, null);
                        }

                        console.log(transOldMap)
                        break;

                }


            }

            tw.from = from;
            tw.to = to;
            normalizeVos(from, to, tw.target.context);

        }

        /*


        let vFrom = tw.fromVal ? tw.fromVal : tw.target.getExistingValue(tw.prop);
        let from = getVo(tw.targetType, tw.prop, vFrom);
        let to = getVo(tw.targetType, tw.prop, tw.toVal);
        normalizeVos(from, to, tw.target.context);
        tw.from = from;
        tw.to = to;
         */
    }


}





