export class Keyframe {
    constructor() {
        this.duration = 0;
        this.totalDuration = 0;
        this.tweens = [];
        this.initialized = false;
    }
    push(...t) {
        for (let i = 0; i < t.length; i++) {
            if (this.totalDuration < t[i].totalDuration)
                this.totalDuration = t[i].totalDuration;
            this.tweens.push(t[i]);
        }
    }
}
