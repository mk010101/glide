import { quadInOut } from "../util/ease";
export class Tween {
    constructor(target, type, prop, duration) {
        this.target = null;
        this.type = null;
        this.prop = "";
        this.duration = 0.0;
        this.from = null;
        this.to = null;
        this.computed = null;
        this.ease = quadInOut;
        this.target = target;
        this.prop = prop;
        this.duration = duration;
    }
}
