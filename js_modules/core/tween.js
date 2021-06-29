import { quadInOut } from "../util/ease";
export class Tween {
    constructor(twType, prop, fromVal, toVal, duration, delay, start) {
        this.tweenable = null;
        this.twType = null;
        this.prop = "";
        this.duration = 0.0;
        this.delay = 0.0;
        this.start = 0.0;
        this.totalDuration = 0.0;
        this.fromVal = null;
        this.toVal = null;
        this.from = null;
        this.to = null;
        this.ease = quadInOut;
        this.keepOld = false;
        this.oldValue = "";
        this.orientToPath = true;
        this.twType = twType;
        this.prop = prop;
        this.duration = duration;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay;
    }
}
