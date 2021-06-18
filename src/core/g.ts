import Target from "./target";
import Dispatcher from "./dispatcher";
import {getTweenType, is} from "../util/util";
import {Keyframe} from "./keyframe";
import {Tween} from "./tween";

export class G extends Dispatcher {

    status = 1;
    targets: Target[] = [];
    keyframes: Keyframe[] = [];

    constructor(targets: any, duration: number, params: any, options: any = {}) {
        super();

        this.targets = G._getTargets(targets, options);

        this.to(duration, params, options);

    }


    to(duration: number, params: any, options: any = {}) {
        let kf = new Keyframe();

        for (let i = 0; i < this.targets.length; i++) {

            const tweens = G.getTweens(this.targets[i], duration, params, options);
        }

        this.keyframes.push(kf);
        return this;
    }


    update(delta: number) {

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

    static getTweens(target:Target, duration:number, params:any, options:any) {

        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            let prop:any = keys[i];
            const val:any = params[prop];
            const twType = getTweenType(target.type, prop);

            let tw = new Tween(target.target, twType, prop, duration);
            console.log(tw)

        }

    }



}





