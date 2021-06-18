import {Tween} from "./tween";

export class Keyframe  {

    duration: number = 0;
    totalDuration: number = 0;
    tweens:Tween[] = [];


    push(...t:Tween[]) {

        for (let i = 0; i < t.length; i++) {
            if (this.totalDuration < t[i].totalDuration)
                this.totalDuration = t[i].totalDuration;

            this.tweens.push(t[i]);
        }

    }

}