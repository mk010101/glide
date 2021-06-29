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


export class PathVo extends Vo {
    path: SVGPathElement = null;
    offsetX:number = 0;
    offsetY:number = 0;
    len:number = 0;
}


export class TweenGroup {
    target: Target = null;
    // tweenable:any = null;
    // targetType:TargetType = "dom";
    tweens: Tween[] = [];

    constructor(target: any) {
        this.target = target;
        // this.tweenable = target.tweenable;
        // this.targetType = target.type;
    }

}
