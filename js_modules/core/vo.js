export class Vo {
    constructor() {
        this.numbers = [];
        this.floats = [];
        this.units = [];
        this.increments = [];
        this.strings = [];
        this.round = -1;
    }
}
export class SvgVo extends Vo {
    constructor() {
        super(...arguments);
        this.path = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.len = 0;
    }
}
export class TweenGroup {
    constructor(target) {
        this.target = null;
        this.tweens = [];
        this.target = target;
    }
}
