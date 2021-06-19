export class Keyframe {
    constructor() {
        this.duration = 0;
        this.totalDuration = 0;
        this.tweens = [];
        this.initialized = false;
    }
    push(...t) {
        for (let i = 0; i < t.length; i++) {
            let tw = t[i];
            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }
            this.tweens.push(t[i]);
        }
    }
}
