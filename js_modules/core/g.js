import Target from "./target";
import Dispatcher from "./dispatcher";
import { getTweenType, is } from "../util/util";
import { Keyframe } from "./keyframe";
import { Tween } from "./tween";
export class G extends Dispatcher {
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
            const tweens = G.getTweens(this.targets[i], duration, params, options);
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
            const val = params[prop];
            const twType = getTweenType(target.type, prop);
            let tw = new Tween(target.target, twType, prop, duration);
            console.log(tw);
        }
    }
}
