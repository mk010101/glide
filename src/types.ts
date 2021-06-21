import {Tween} from "./core/tween";

export type TargetType = "dom" | "obj";
export type TweenType = "transform" | "filter" | "color" | "css" | "direct" | "obj";
export type ValueType = "null" | "number" | "string";

export type Value = {
    duration: number;
    value: any;
    ease?: Function;
}

export type ValueUnit = {
    value:number;
    unit:string;
    increment: string;
}

export type TweenGroup = {
    type:TargetType;
    tweenable:any;
    tweens:Tween[];
}