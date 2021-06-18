import Context from "./context";
import {is} from "../util/util";
import {TargetType} from "../types";

export default class Target {

    target: any;
    type: TargetType;
    tweenable:any;
    style: CSSStyleDeclaration;
    cssTxt: string;
    computedStyle: CSSStyleDeclaration;
    context: Context;


    constructor(target: any, context: Context) {

        this.target = target;
        this.context = context;
        this.init();
    }

    init() {
        this.type = is.dom(this.target)? "dom" : "obj";
        if (this.type === "dom") {
            this.style = this.target.style;
            this.cssTxt = this.style.cssText;
            this.tweenable = this.style;
            this.computedStyle = window.getComputedStyle(this.target);
        } else {
            this.tweenable = this.target;
        }
    }

    getExistingValue(prop: any): any {
        let res: any;
        if (this.type === "obj" || is.propDirect(prop)) {
            return this.target[prop];
        } else {
            if (is.propTransform(prop))
                prop = "transform";
            else if (is.propFilter(prop))
                prop = "filter";
        }

        if (this.style) {
            res = this.style[prop];
        }
        if ((!res || res === "none" || res === "") && this.computedStyle) {
            res = this.computedStyle[prop];
        }
        if (!res || res === "none" || res === "") {
            return null;
        }

        return res;

    }

    setValue(prop: any, val: any) {
        if (this.type === "dom") {
            this.style[prop] = val;
        } else {
            this.target[prop] = val;
        }
    }

}