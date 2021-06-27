import {TweenGroup} from "./vo";

export class Keyframe {


    duration: number = 0;
    totalDuration: number = 0;
    initialized = false;
    tgs: TweenGroup[] = [];
    callFunc:Function = null;
    callParams:any = null;
    startTime = 0;



    push(tg: TweenGroup) {

        for (let i = 0; i < tg.tweens.length; i++) {
            let tw = tg.tweens[i];

            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }
        }
        this.tgs.push(tg);
    }

}