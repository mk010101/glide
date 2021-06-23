export class Vo {
    constructor() {
        this.targetType = "dom";
        this.tweenType = "css";
        this.prop = "";
        this.values = [];
        this.units = [];
        this.increments = [];
        this.isNumber = false;
        this.strBegin = "";
        this.keepOriginal = false;
        this.keepStr = "";
        this.diffVals = [];
    }
}
export class TweenGroup {
    constructor(target) {
        this.target = null;
        this.tweenable = null;
        this.type = "dom";
        this.tweens = [];
        this.target = target;
        this.tweenable = target.tweenable;
        this.type = target.type;
    }
}
