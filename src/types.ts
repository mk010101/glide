
export type TargetType = "dom" | "obj";
export type TweenType = "transform" | "filter" | "other" | "direct" | "obj";
export type ValueType = "null" | "number" | "string";
export type PropType = "transform" | "filter" | "color" | "matrix" | "other";

export type Value = {
    value: any;
    duration?: number;
    ease?: Function;
}

export type ValueUnit = {
    value:number;
    unit:string;
    increment: string;
}
