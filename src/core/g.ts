import Target from "./target";
import Dispatcher from "./dispatcher";
import {is} from "../util/util";

export class G extends Dispatcher{

    status = 1;
    targets:Target[] = [];

    constructor(targets:any, duration:number, params:any, option:any = {}) {
        super();

    }


    to(duration:number, params:any, option:any) {

        return this;
    }


    update(delta:number) {

    }

    static _getTargets(targets: any, options: any): Target[] {
        if (typeof targets === "string") {
            targets = document.querySelectorAll(targets);
        }

        let t: Target[] = [];

        if (is.list(targets)) {
            for (let i = 0; i < targets.length; i++) {
                t.push(new Target(targets[i], options.context));
            }
        } else if (is.tweenable(targets)) {
            t.push(new Target(targets, options.context));
        } else {
            throw (new TypeError("Target type is not valid."));
        }
        return t;
    }

}