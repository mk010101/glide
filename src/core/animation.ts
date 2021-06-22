import Target from "./target";
import Dispatcher from "./dispatcher";
import {getPropType, getTweenType, getVo, minMax, normalizeVos, print, strToMap, unwrapValues} from "../util/util";
import {Keyframe} from "./keyframe";
import {Tween} from "./tween";
import {Evt} from "./events";
import {TweenGroup, Value} from "../types";
import {Vo} from "./vo";
import {is} from "../util/regex";
import * as $Ease from "../util/ease";

const Ease: { [key: string]: any } = $Ease;

export class Animation extends Dispatcher {

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

        this.targets = Animation._getTargets(targets, options);
        this.to(duration, params, options);

    }


    to(duration: number, params: any, options: any = {}) {

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


    update(t: number) {

        if ((this.paused && !this.seeking) || this.status === 0) return;

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
            // const type = tg.type;
            // let obj:any = {};

            let transformsStr = "";
            let filtersStr = "";

            for (let j = 0; j < tg.tweens.length; j++) {
                const tween = tg.tweens[j];
                const twType = tween.type;


                let elapsed = minMax(this.time - tween.start - tween.delay, 0, tween.duration) / tween.duration;
                if (elapsed === 0 && this.dir === 1) return;
                let eased = isNaN(elapsed) ? 1 : tween.ease(elapsed);
                let from: Vo = tween.from;
                let to: Vo = tween.to;
                let tweenable = tween.tweenable;
                let prop = tween.prop;
                const isNum = from.isNumber;

                switch (twType) {

                    case "css":

                        if (isNum) {
                            tweenable[prop] = from.values[0] + eased * (to.values[0] - tween.from.values[0]);
                        } else {
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
                        // obj[prop] = `${to.strBegin}(${r}, ${g}, ${b}${a})`;
                        break;

                    case "transform":
                        if (from.keepOriginal) {
                            transformsStr += from.keepStr + " ";
                        } else {
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
                        } else if (from.keepOriginal) {
                            filtersStr += from.keepStr + " ";
                        } else {
                            let v = from.values[0] + eased * to.diffVals[0];
                            filtersStr += `${to.prop}(${v}${to.units[0]}) `;
                        }
                        break;

                    case "direct":
                        tweenable[prop] = from.values[0] + eased * to.diffVals[0];
                        break
                }

            }

            if (transformsStr) {
                tweenable.transform = transformsStr;
                // obj.transform = transformsStr;
            }
            // Object.assign(tweenable,obj);


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
            let staggerTime = 0;
            for (let i = 0; i < targets.length; i++) {
                let target = new Target(targets[i], options.context);
                target.pos = i;
                t.push(target);
            }
        } else if (is.tweenable(targets)) {
            t.push(new Target(targets, options.context));
        } else {
            throw (new TypeError("Target type is not valid."));
        }
        return t;
    }


    static _getTweens(target: Target, duration: number, params: any, options: any): any {

        const keys = Object.keys(params);

        let tg: TweenGroup = {
            type: target.type,
            tweenable: target.tweenable,
            tweens: []
        };

        for (let i = 0; i < keys.length; i++) {
            let prop: any = keys[i];
            let val: any = params[prop];

            /*
            // If value is like scale(2) or translate(20px 5rem), unwrap it.
            if (target.type === "dom" && is.propDual(prop)) {
                let res = unwrapValues(prop, val);
                tg.tweens.push(Animation._getTween(target, res[0].prop, res[0].val, duration, options));
                tg.tweens.push(Animation._getTween(target, res[1].prop, res[1].val, duration, options));
            } else {
                let tw = Animation._getTween(target, prop, val, duration, options);
                tg.tweens.push(tw);
            }
            //*/

            let tw = Animation._getTween(target, prop, val, duration, options);
            tg.tweens.push(tw);


        }
        return tg;
    }


    static _getTween(target: Target, prop: string, val: any, dur: number, options: any): Tween {
        let fromVal: any;
        let toVal: any;

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
        if (twType === "direct") tw.tweenable = target.target;

        if (options.stagger) {
            let del = target.pos * options.stagger;
            tw.start = del;
            tw.totalDuration += del;
        }

        let ease: any;
        let optEase = options.ease;
        if (optEase) {
            if (is.string(optEase)) {
                let res = optEase.match(/[\w]+|[-\d.]+/g);
                if (res && res.length === 1) {
                    ease = Ease[optEase];
                } else if (res && res.length === 2) {
                    let e = Ease[res[0]];
                    if (is.func(e)) ease = Ease[res[0]](parseFloat(res[1]));
                }
            } else ease = optEase;
        }
        tw.ease = ease || Ease.quadInOut;
        tw.propType = getPropType(prop);

        return tw;
    }


    static _initTweens(kf: Keyframe) {

        for (let i = 0; i < kf.tgs.length; i++) {

            const tg = kf.tgs[i];

            let transTweens: Map<string, Tween>;
            let transOldTweens: Map<string, Tween>;
            let transChecked = false;

            let filterTweens: Map<string, Tween>;
            let filterOldTweens: Map<string, Tween>;
            let filterChecked = false;

            let oldTweens: Map<string, Tween>;
            let newTweens: Map<string, Tween>;

            for (let j = 0; j < tg.tweens.length; j++) {
                const tw = tg.tweens[j];

                let from: Vo;
                let to: Vo = getVo(tw.targetType, tw.prop, tw.toVal);

                if (tw.target.type === "dom") {

                    switch (tw.type) {

                        case "css":
                        case "color":
                        case "direct":
                            if (tw.fromVal) from = getVo(tw.targetType, tw.prop, tw.fromVal);
                            else
                                from = getVo(tw.targetType, tw.prop, tw.target.getExistingValue(tw.prop));
                            break;

                        case "transform":
                        case "filter":

                            if (tw.type === "transform" && !transChecked) {
                                transOldTweens = strToMap(tw.target.getExistingValue("transform"));
                                transTweens = new Map<string, Tween>();
                                transChecked = true;
                                oldTweens = transOldTweens;
                                newTweens = transTweens;
                            } else if (tw.type === "filter" && !filterChecked) {
                                filterOldTweens = strToMap(tw.target.getExistingValue("filter"));
                                filterTweens = new Map<string, Tween>();
                                filterChecked = true;
                                oldTweens = filterOldTweens;
                                newTweens = filterTweens;
                            }

                            if (tw.fromVal) {
                                from = getVo("dom", tw.prop, tw.fromVal);
                            } else {
                                if (oldTweens && oldTweens.has(tw.prop)) {
                                    // console.log(tw.prop)
                                    from = oldTweens.get(tw.prop).from;
                                    from.keepOriginal = false;
                                } else {
                                    from = from = getVo("dom", tw.prop, tw.fromVal);
                                }
                            }
                            newTweens.set(tw.prop, tw);
                            break;


                    }
                } else {
                    if (!tw.fromVal) tw.fromVal = tw.target.getExistingValue(tw.prop);
                    from = getVo("obj", tw.prop, tw.fromVal);
                }

                tw.from = from;
                tw.to = to;
                // console.log(from, to)
                normalizeVos(from, to, tw.target.context);
            }

            if (transOldTweens) {
                transTweens.forEach((v, k) => {
                    transOldTweens.set(k, v);
                });
                // console.log(transOldTweens)

                for (let j = tg.tweens.length - 1; j >= 0; j--) {
                    if (tg.tweens[j].type === "transform") {
                        tg.tweens.splice(j, 1);
                    }
                }

                transOldTweens.forEach((v) => {
                    tg.tweens.push(v)
                });

            }

        }

    }


}





