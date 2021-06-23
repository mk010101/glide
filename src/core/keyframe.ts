import {TweenGroup} from "./vo";

export class Keyframe {


    duration: number = 0;
    totalDuration: number = 0;
    initialized = false;
    tgs: TweenGroup[] = [];
    callFunc:Function = null;
    callParams:any = null;



    push(tg: TweenGroup) {

        for (let i = 0; i < tg.tweens.length; i++) {
            let tw = tg.tweens[i];

            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }



            /*
            if (tw.type === "transform") {
                if (!this.transforms) this.transforms = [];
                this.transforms.push(tw);
            } else if (tw.type === "filter") {
                if (!this.filters) this.filters = [];
                this.filters.push(tw);
            } else {
                this.tweens.push(tw);
            }

             */

        }
        this.tgs.push(tg);



    }

}