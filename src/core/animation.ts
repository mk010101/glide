import Target from "./target";
import Dispatcher from "./dispatcher";
import {
    getPropType,
    getTweenType,
    getVo,
    minMax,
    normalizeTween,
    stringToPropsVals,
    strToMap,
    unwrapValues
} from "../util/util";
import {Keyframe} from "./keyframe";
import {Tween} from "./tween";
import {Evt} from "./events";
import {TweenType, Value} from "../types";
import {SvgVo, TweenGroup, Vo} from "./vo";
import {is} from "../util/regex";
import * as $Ease from "../util/ease";

const Ease: { [key: string]: any } = $Ease;

export class Animation extends Dispatcher {

    status = 1;
    targets: Target[] = [];
    keyframes: Keyframe[] = [];
    paused = false;
    time = 0.0;
    totalDuration = 0.0;
    currentTime = 0.0;
    runningTime = 0.0;
    playedTimes = 0;
    loop = true;
    repeat = 1;
    keep: false;

    _pos: number = 0;
    _currentKf: Keyframe;
    _seeking = false;
    _preSeekState: number = 1;
    _dir = 1;

    constructor(targets: any, duration: number, params: any, options: any = {}) {
        super();

        this.repeat = (options.repeat != (void 0) && options.repeat > 0) ? options.repeat + 1 : this.repeat;
        this.loop = options.loop != (void 0) ? options.loop : this.loop;
        this.paused = options.paused != (void 0) ? options.paused : this.paused;
        this.keep = options.keep != (void 0) ? options.keep : this.keep;

        if (targets != void 0 && duration != void 0) {

        } else {
            this.status = 0;
        }

        this.target(targets, options);

        if (duration !== void 0)
            this.to(duration, params, options);

    }

    target(targets: any, options: any = {}) {
        this.targets = Animation._getTargets(targets, options);
        options.numTargets = this.targets.length;
        return this;
    }


    to(duration: number, params: any, options: any = {}) {

        let kf = new Keyframe(this.keyframes.length);


        for (let i = 0; i < this.targets.length; i++) {
            const tg = Animation._getTweens(this.targets[i], duration, params, options);
            kf.push(tg);
        }
        // Animation._initTweens(kf);
        kf.startTime = this.totalDuration / this.repeat;
        this.totalDuration += kf.totalDuration * this.repeat;

        this.keyframes.push(kf);

        if (!this._currentKf) {
            this._currentKf = kf;
        }
        if (this.status === 0) this.status = 1;
        return this;
    }

    set(params: any, options: any) {

        return this.to(1, params, options);

        /*
        let kf = new Keyframe();

        for (let i = 0; i < this.targets.length; i++) {
            const tg = Animation._getTweens(this.targets[i], 0, params, {});
            kf.push(tg);
            Animation._initTweens(kf);
            Animation._render(kf.tgs, 1, 1)
        }
        return this;
         */
    }

    getProgress() {
        let p = Math.floor(this.runningTime * 100 / this.totalDuration);
        return minMax(p, 0, 100);
    }

    getCurrentKeyframe() {
        return this._currentKf;
    }


    update(t: number) {

        if ((this.paused || this.status < 1) && !this._seeking) return;

        //*
        if (!this._currentKf.initialized) {
            Animation._initTweens(this._currentKf);
            this._currentKf.initialized = true;
            this.dispatch(Evt.start, null);
        }
        //*/

        this.time += t * this._dir;
        this.currentTime += t;
        this.runningTime += t;

        // console.log(~~this.time, ~~this.currentTime)

        const tgs = this._currentKf.tgs;

        //this.dispatch(Evt.progress, null);
        Animation._render(tgs, this.time, this._dir);
        this.dispatch(Evt.progress, null);

        if (this.currentTime >= this._currentKf.totalDuration) {

            this.dispatch(Evt.keyframeend, null);

            if (this._currentKf.callFunc) {
                this._currentKf.callFunc(this._currentKf.callParams);
            }

            if (this._dir > 0 && this.keyframes.length > this._pos + 1) {
                this._pos++;
                this.time = 0;
                this._currentKf = this.keyframes[this._pos];
            } else if (this._dir < 0 && this._pos > 0) {
                this._pos--;
                this._currentKf = this.keyframes[this._pos];
                this.time = this._currentKf.totalDuration;

            } else {
                this.dispatch(Evt.loopend, null);
                this.playedTimes++;
                if (this.playedTimes < this.repeat) {
                    if (this.loop) {
                        this._dir *= -1;
                    } else {
                        this.reset();
                        this._currentKf = this.keyframes[0];
                    }
                } else {
                    this.status = this.status = this.keep ? 0 : -1;
                    this.dispatch(Evt.end, null);
                }
            }
            this.currentTime = 0;

        }

        // this.time += t * this._dir;
        // this.currentTime += t;
        // this.runningTime += t;

    }


    call(func: Function, ...params: any) {
        let kf = new Keyframe(this.keyframes.length);
        kf.callFunc = func;
        kf.callParams = params;
        this.keyframes.push(kf);
        return this;
    }


    remove(target: any = null) {

        if (!target) {
            this.status = -1;
            this.keep = false;
            this.keyframes = [];
            this.targets = [];
        } else {
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
    }


    reset() {
        this.stop();
        this.status = 1;
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            const tgs = this.keyframes[i].tgs;
            if (this.keyframes[i].initialized) {
                for (let j = 0; j < tgs.length; j++) {
                    Animation._render(tgs, 0, -1);
                }
            }
        }
    }


    stop() {
        this.status = 0;
        this._pos = 0;
        this._currentKf = this.keyframes[0];
        this.currentTime = 0;
        // this.runningTime = 0;
        // this.playedTimes = 0;
        this._dir = 1;
        this.time = 0;
    }

    play() {
        if (this.status > -1) {
            this.status = 1;
            this.paused = false;
        }
    }

    seek(ms: number) {
        ms = minMax(ms, 0, this.totalDuration);

        this._seeking = true;
        this._preSeekState = this.status;
        this.runningTime = 0;
        this.playedTimes = 0;
        this.status = 0;

        this.reset();

        while (ms >= 0) {
            this.update(10);
            ms -= 10;
        }

        this.status = this._preSeekState;
        this._seeking = false;
    }

    /* =================================================================================================================
        STATIC METHODS
     =================================================================================================================*/

    static _getRenderStr(tw: Tween, t: number): any {
        let str = "";

        let from = tw.from;
        let to = tw.to;

        if (to.numbers.length === 1 && to.units[0] == null) {
            let val = from.numbers[0] + t * (to.numbers[0] - from.numbers[0]);
            if (to.floats[0] === 0)
                val = ~~val;
            else if (to.round > 0)
                val = Math.round(val * to.round) / to.round;
            return val;
        }

        for (let i = 0; i < to.numbers.length; i++) {
            let nfrom = from.numbers[i];
            let nto = to.numbers[i];
            if (nto != null) {
                let val = nfrom + t * (nto - nfrom);
                if (to.floats[i] === 0)
                    val = ~~val;
                else if (to.round > 0)
                    val = Math.round(val * to.round) / to.round;
                str += val + to.units[i];
            } else {
                str += to.strings[i];
            }
        }
        // console.log(str);
        return str;
    }

    static _getPathStr(tw: Tween, t: number) {

        const vo: SvgVo = <SvgVo>tw.to;
        const path = vo.path;
        const box: any = vo.bBox;
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

        let x: number, y: number;

        if (is.svg(tw.tweenable)) {
            x = pos.x - vo.bBox.x;
            y = pos.y - vo.bBox.y;

            let a1 = vo.bBox.x;
            let a2 = vo.bBox.y;
            rotStr = ` rotate(${rot}, ${a1}, ${a2})`;
            tw.tweenable.setAttribute("transform",
                `translate(${x}, ${y}) 
            ${rotStr} 
            translate(${vo.offsetX}, ${vo.offsetX})`);
        } else {
            let screenPt = pos.matrixTransform(vo.svg.getScreenCTM());
            let offsetX = box.x - vo.offsetX;
            let offsetY = box.y - vo.offsetY;
            tw.tweenable.transform = `translate(${screenPt.x - offsetX}px, ${screenPt.y - offsetY}px) rotate(${rot}${deg})`;
            // console.log(offsetX, offsetY)
        }

    }

    static _render(tgs: TweenGroup[], time: number, dir: number) {

        for (let i = 0, k = tgs.length; i < k; i++) {

            const tg = tgs[i];
            // const tweenable = tg.target.tweenable;
            // const type = tg.type;
            // let obj:any = {};

            let transStr = "";
            let filtersStr = "";

            for (let j = 0, f = tg.tweens.length; j < f; j++) {
                const tween = tg.tweens[j];
                const twType = tween.twType;


                let elapsed = minMax(time - tween.start - tween.delay, 0, tween.duration) / tween.duration;
                if (elapsed === 0 && dir === 1) return;
                let eased = isNaN(elapsed) ? 1 : tween.ease(elapsed);
                let from: Vo = tween.from;
                let to: Vo = tween.to;
                let tweenable = tween.tweenable;
                let prop = tween.prop;


                switch (twType) {

                    case "transform":
                        if (tween.keepOld) {
                            transStr += tween.oldValue + " ";
                        } else {
                            transStr += Animation._getRenderStr(tween, eased) + " ";
                        }
                        break;

                    case "filter":
                        if (tween.keepOld) {
                            filtersStr += tween.oldValue + " ";
                        } else {
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
                        //tweenable.setAttribute(prop, Animation._getRenderStr(tween, eased));
                        break;


                }

            }

            const tweenable: any = tg.target.tweenable;

            // console.log(filtersStr)
            if (transStr) {
                // console.log(transStr)
                if (tg.target.type === "dom")
                    tweenable.transform = transStr;
                else if (tg.target.type === "svg")
                    tweenable.setAttribute("transform", transStr);
            }

            if (filtersStr)
                tweenable.filter = filtersStr;

        }

    }


    static _getTargets(targets: any, options: any): Target[] {
        if (is.string(targets)) {
            targets = document.querySelectorAll(targets);
        }

        let t: Target[] = [];

        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                let targ: any;

                if (is.string(targets[i]))
                    targ = document.querySelector(targets[i]);
                else
                    targ = targets[i];

                let target = new Target(targ, options.context);
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

        let tg = new TweenGroup(target);

        for (let i = 0; i < keys.length; i++) {
            let prop: any = keys[i];
            let val: any = params[prop];

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

            if (target.type === "dom") {

                if (prop === "transform") {
                    let propsVals = stringToPropsVals(val);
                    for (let j = 0; j < propsVals.length; j++) {
                        let p = propsVals[j].prop;
                        let v = propsVals[j].value;
                        let unwrapped = Animation._unwrap(target, twType, p, v, duration, options);
                        tg.tweens.push(...unwrapped);
                    }
                    continue;
                } else if (is.propTransform(prop)) {
                    let unwrapped = Animation._unwrap(target, twType, prop, val, duration, options);
                    for (let j = 0; j < unwrapped.length; j++) {
                        unwrapped[j].isIndividualTrans = true;
                    }
                    tg.tweens.push(...unwrapped);
                    continue;
                }
            }


            let tw = Animation._getTween(twType, target, prop, val, duration, options);
            tg.tweens.push(tw);


        }
        return tg;
    }


    static _unwrap(target: Target, twType: TweenType, prop: string, val: any, duration: number, options: any): Tween[] {
        let arr: Tween[] = [];
        if (is.propDual(prop)) {
            let res = unwrapValues(prop, val);
            arr.push(Animation._getTween(twType, target, res[0].prop, res[0].val, duration, options));
            arr.push(Animation._getTween(twType, target, res[1].prop, res[1].val, duration, options));
        } else {
            arr.push(Animation._getTween(twType, target, prop, val, duration, options));
        }
        return arr;
    }


    static _getTween(twType: TweenType, target: Target, prop: string, val: any, dur: number, options: any): Tween {

        let fromVal: any;
        let toVal: any;

        let optEase = options.ease;
        if (is.array(val)) {
            fromVal = val[0];
            toVal = val[1];
        } else if (is.obj(val)) {
            const o: Value = val;
            toVal = o.value != (void 0) ? o.value : val;
            dur = o.duration != (void 0) ? o.duration : dur;
            optEase = o.ease != (void 0) ? o.ease : options.ease;
        } else {
            toVal = val;
        }

        let delay = options.delay || 0;
        let tw = new Tween(twType, prop, fromVal, toVal, dur, delay, 0);
        tw.options = options;
        if (twType === "direct") {
            tw.tweenable = target.el;
        } else {
            tw.tweenable = target.tweenable;
        }

        if (options.stagger) {

            let del = options.stagger > 0 ? target.pos * options.stagger : options.numTargets * -options.stagger + target.pos * options.stagger;
            // let del = target.pos * options.stagger;
            tw.start = del;
            tw.totalDuration += del;
        }

        let ease: any;

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
                let to: Vo = getVo(tg.target, tw.prop, tw.toVal, tw.options);

                const twType = tw.twType;

                const multi = twType === "transform" || twType === "filter";

                if (multi) {
                    if (twType === "transform" && !transChecked) {
                        if (tw.isIndividualTrans) {
                            //TODO: Need a solution for decomposing matrices.
                            transOldTweens = strToMap(tg.target.getExistingValue("transform"), "transform", tg.target.type);
                            // let old = getNormalizedTransforms(tg.target.computedStyle.transform);
                            // transOldTweens = strToMap(old, "transform");
                        } else {
                            transOldTweens = strToMap(tg.target.getExistingValue("transform"), "transform", tg.target.type);
                        }
                        transTweens = new Map<string, Tween>();
                        transChecked = true;
                        oldTweens = transOldTweens;
                        newTweens = transTweens;
                    } else if (twType === "filter" && !filterChecked) {
                        filterOldTweens = strToMap(tg.target.getExistingValue("filter"), "filter", tg.target.type);
                        filterTweens = new Map<string, Tween>();
                        filterChecked = true;
                        oldTweens = filterOldTweens;
                        newTweens = filterTweens;
                    }

                    if (tw.fromVal) {
                        from = getVo(tg.target, tw.prop, tw.fromVal);
                    } else {
                        if (oldTweens && oldTweens.has(tw.prop)) {
                            from = oldTweens.get(tw.prop).from;
                            tw.keepOld = false;
                        } else {
                            from = getVo(tg.target, tw.prop, tw.fromVal);
                        }
                    }
                    tw.from = from;
                    tw.to = to;
                    newTweens.set(tw.prop, tw);
                } else {
                    if (!tw.fromVal) tw.fromVal = tg.target.getExistingValue(tw.prop);
                    from = getVo(tg.target, tw.prop, tw.fromVal);
                    tw.from = from;
                    tw.to = to;
                }
                normalizeTween(tw, tg.target);
            }


            if (transOldTweens) Animation._arrangeMaps(transOldTweens, transTweens, tg, "transform");
            if (filterOldTweens) Animation._arrangeMaps(filterOldTweens, filterTweens, tg, "filter");

        }

    }


    static _arrangeMaps(oldM: Map<string, Tween>, newM: Map<string, Tween>, tg: TweenGroup, prop: TweenType) {

        newM.forEach((v, k) => {
            oldM.set(k, v);
        });
        // console.log(transOldTweens)

        for (let j = tg.tweens.length - 1; j >= 0; j--) {
            if (tg.tweens[j].twType === prop) {
                tg.tweens.splice(j, 1);
            }
        }

        oldM.forEach((v) => {
            tg.tweens.push(v)
        });
    }


}





