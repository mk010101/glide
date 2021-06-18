import { quadInOut } from "../util/ease";
export class Tween {
    constructor() {
        this.target = null;
        this.type = null;
        this.prop = "";
        this.duration = 0.0;
        this.from = null;
        this.to = null;
        this.computed = null;
        this.ease = quadInOut;
    }
}
