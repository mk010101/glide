export class Keyframe {
    constructor() {
        this.duration = 0;
        this.totalDuration = 0;
        this.initialized = false;
        this.tgs = [];
        this.callFunc = null;
        this.callParams = null;
    }
    push(tg) {
        for (let i = 0; i < tg.tweens.length; i++) {
            let tw = tg.tweens[i];
            if (this.totalDuration < tw.totalDuration) {
                this.totalDuration = tw.totalDuration;
            }
        }
        this.tgs.push(tg);
    }
}
