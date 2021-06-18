export type TargetType = "dom" | "obj";
export type TweenType = "transform" | "filter" | "css" | "direct" | "obj";

export type Value = {
    duration:number;
    value:any;
    ease?:Function;
}