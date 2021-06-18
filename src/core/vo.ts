import {TargetType, TweenType} from "../types";

export class Vo {
    targetType:TargetType = "dom";
    tweenType:TweenType = "css";
    prop:any = "";
    values: number[] = [];
    units: string[] = [];
    increments: string[] = [];
    strBegin:string = "";
    keepOriginal:boolean = false;
    keepStr:string = "";
    diffVals:number[] = [];
    // normalizedUnits: string[] = [];
}