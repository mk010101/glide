import {Tween} from "./tween";
import Target from "./target";

export class Vo {
    // targetType:TargetType = "dom";
    // tweenType:TweenType = "css";
    // prop:any = "";
    floats: number[] = [];/// float:1, int:0
    numbers: number[] = [];
    units: string[] = [];
    increments: string[] = [];
    strings: string[] = [];

    // isNumber:boolean = false;
    // strBegin:string = "";
    // keepOriginal:boolean = false;
    // keepStr:string = "";
    // diffVals:number[] = [];
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
