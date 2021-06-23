import {PropType, TargetType, TweenType} from "../types";
import {quadInOut} from "../util/ease";
import {Vo} from "./vo";
import Target from "./target";
import {getPropType} from "../util/util";

export class Tween {
    // target:Target;
    tweenable: any = null;
    twType: TweenType = null;
    propType:PropType;
    // targetType:TargetType = null;
    prop: any = "";
    duration: number = 0.0;
    delay = 0.0;
    start = 0.0;
    totalDuration = 0.0;
    fromVal:any = null;
    toVal:any = null;
    from: Vo = null;
    to: Vo = null;
    ease: Function = quadInOut;
    // initialized = false;
    isNum = false;

    // nums:number[] = [];
    // strings:string[] = [];

    // computed: Vo = new Vo();

    constructor(
                twType: TweenType,
                prop: any,
                fromVal:any,
                toVal:any,
                duration: number,
                delay: number,
                start: number) {

        // this.target = target;
        // this.tweenable = target?.tweenable;
        // this.targetType = target?.type;
        this.twType = twType;
        this.prop = prop;
        this.duration = duration;
        this.fromVal = fromVal;
        this.toVal = toVal;
        this.delay = delay;
        this.start = start;
        this.totalDuration = duration + delay; /// needs changing.
    }


}