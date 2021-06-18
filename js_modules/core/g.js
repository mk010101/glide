import Target from "./target";
import Dispatcher from "./dispatcher";
import { is } from "../util/util";
export class G extends Dispatcher {
    constructor(targets, duration, params, option = {}) {
        super();
        this.status = 1;
        this.targets = [];
    }
    to(duration, params, option) {
        return this;
    }
    update(delta) {
    }
    static _getTargets(targets, options) {
        if (typeof targets === "string") {
            targets = document.querySelectorAll(targets);
        }
        let t = [];
        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                t.push(new Target(targets[i], options.context));
            }
        }
        else if (is.tweenable(targets)) {
            t.push(new Target(targets, options.context));
        }
        else {
            throw (new TypeError("Target type is not valid."));
        }
        return t;
    }
}
