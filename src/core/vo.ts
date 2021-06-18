import {TargetType, TweenType} from "../types";

export class Vo {
    targetType:TargetType = "dom";
    tweenType:TweenType = "css";
    prop:any = "";
    values: number[] = [];
    units: string[] = [];
    increments: number[] = [];
    keep:boolean = false;
    keepStr:string = "";

}