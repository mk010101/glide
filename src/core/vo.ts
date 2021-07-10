import {Tween} from "./tween";
import Target from "./target";

export class Vo {

    numbers: number[] = [];
    floats: number[] = [];/// float:1, int:0
    units: string[] = [];
    increments: string[] = [];
    strings: string[] = [];

    // isNum:boolean = false;

}


export class SvgVo extends Vo {
    path: SVGPathElement = null;
    offsetX:number = 0;
    offsetY:number = 0;
    len:number = 0;
    bBox:any;
    svg:any;
}


export class TweenGroup {
    target: Target = null;

    tweens: Tween[] = [];

    constructor(target: any) {
        this.target = target;
    }

}
