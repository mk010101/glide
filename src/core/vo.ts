import {TargetType, TweenType} from "../types";
import {Tween} from "./tween";

export class Vo {
    targetType:TargetType = "dom";
    tweenType:TweenType = "css";
    prop:any = "";
    values: number[] = [];
    units: string[] = [];
    increments: string[] = [];
    isNumber:boolean = false;
    strBegin:string = "";
    keepOriginal:boolean = false;
    keepStr:string = "";
    diffVals:number[] = [];
}

export class TweenGroup {
    target:any = null;
    tweenable:any = null;
    type:TargetType = "dom";
    tweens:Tween[] = [];

    constructor(target:any) {
        this.target = target;
        this.tweenable = target.tweenable;
        this.type = target.type;
    }

}
