import {TargetType, TweenType} from "../types";
import {quadInOut} from "../util/ease";
import {Vo} from "./vo";
import Target from "./target";

export class Tween {
    target:Target;
    tweenable: any = null;
    type: TweenType = null;
    targetType:TargetType = null;
    prop: any = "";
    duration: number = 0.0;
    delay = 0.0;
    start = 0.0;
    totalDuration = 0.0;
    fromVal:any = null;
    toVal:any = null;
    from: Vo = null;
    to: Vo = null;
    computed: Vo = null;
    ease: Function = quadInOut;
    initialized = false;
    // pos = 0;

    constructor(target: Target,
                twType: TweenType,
                prop: any,
                fromVal:any,
                toVal:any,
                duration: number,
                delay: number,
                start: number) {

        this.target = target;
        this.tweenable = target?.tweenable;
        this.targetType = target?.type;
        this.type = twType;
        this.prop = prop;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.duration = duration;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay; /// needs changing.
    }


}