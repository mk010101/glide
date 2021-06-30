
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

export type OffsetBox = {
    svg: {
        x: number,
        y: number,
        w: number,
        h: number,
        bbX: number,
        bbY: number,
        scaleX: number,
        scaleY: number,
    },
    el: {
        x: number,
        y: number,
        w: number,
        h: number,
    }
}
