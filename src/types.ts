
export type TargetType = "dom" | "svg" | "obj";
export type TweenType = "transform" | "filter" | "other" | "direct" | "obj" | "svg" | "path";
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

export type PropValue = {
    prop:string;
    value:any;
}
