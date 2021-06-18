import {TweenType} from "../types";
import {quadInOut} from "../util/ease";
import {Vo} from "./vo";

export class Tween {
    target: any = null;
    type: TweenType = null;
    prop: any = "";
    duration: number = 0.0;
    delay = 0.0;
    start = 0.0;
    totalDuration = 0.0;
    from: Vo = null;
    to: Vo = null;
    computed: Vo = null;
    ease: Function = quadInOut;

    constructor(target: any, type: TweenType, prop: any, duration: number, delay: number, start: number) {
        this.target = target;
        this.type = type;
        this.prop = prop;
        this.duration = duration;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay; /// needs changing.
    }


}