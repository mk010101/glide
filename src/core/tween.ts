import {PropType, TweenType} from "../types";
import {quadInOut} from "../util/ease";
import {Vo} from "./vo";


export class Tween {
    tweenable: any = null;
    twType: TweenType = null;
    propType:PropType;
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

    keepOld = false;
    oldValue: string = "";

    orientToPath = true;

    constructor(
                twType: TweenType,
                prop: any,
                fromVal:any,
                toVal:any,
                duration: number,
                delay: number,
                start: number) {


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