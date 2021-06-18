import { quadInOut } from "../util/ease";
export class Tween {
    constructor(target, type, prop, duration, delay, start) {
        this.target = null;
        this.type = null;
        this.prop = "";
        this.duration = 0.0;
        this.delay = 0.0;
        this.start = 0.0;
        this.totalDuration = 0.0;
        this.from = null;
        this.to = null;
        this.computed = null;
        this.ease = quadInOut;
        this.target = target;
        this.type = type;
        this.prop = prop;
        this.duration = duration;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay;
    }
}
