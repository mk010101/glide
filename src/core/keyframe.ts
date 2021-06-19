import {Tween} from "./tween";

export class Keyframe {

    duration: number = 0;
    totalDuration: number = 0;
    tweens: Tween[] = [];
    // transTweens: Tween[];
    initialized = false;


    push(...t: Tween[]) {

        for (let i = 0; i < t.length; i++) {
            let tw = t[i];

            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }

            /*if (tw.type === "transform") {
                if (!this.transTweens) this.transTweens = [];
                this.transTweens.push(tw);
            }*/

            this.tweens.push(t[i]);
        }

    }

}