import { quadInOut } from "../util/ease";
export class Tween {
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
        this.tweenable = target === null || target === void 0 ? void 0 : target.tweenable;
        this.targetType = target === null || target === void 0 ? void 0 : target.type;
        this.type = twType;
        this.prop = prop;
        this.duration = duration;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay;
    }
}
