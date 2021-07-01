
export type TargetType = "dom" | "svg" | "obj";
export type TweenType = "transform" | "directTr" | "filter" | "other" | "direct" | "obj" | "svg" | "path";
export type ValueType = "null" | "number" | "string";
export type PropType = "transform" | "directTr" | "filter" | "color" | "matrix" | "other";

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

