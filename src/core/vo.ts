import {Tween} from "./tween";
import Target from "./target";

export class Vo {

    float: number = 1;/// float:1, int:0
    number: number = undefined;
    unit: string = "";
    increment: string = null;
    string: string;
    isNum:boolean = true;

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
