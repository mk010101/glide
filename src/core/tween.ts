import {TweenType} from "../types";
import {quadInOut} from "../util/ease";
import {Vo} from "./vo";

export class Tween {
    target: any = null;
    type: TweenType = null;
    prop: any = "";
    duration: number = 0.0;
    from:Vo = null;
    to:Vo = null;
    computed:Vo = null;
    ease:Function = quadInOut;

}