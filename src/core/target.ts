import Context from "./context";
import {is} from "../util/util";

export default class Target {

    target: any;
    type: "dom" | "object";
    inlineStyle: CSSStyleDeclaration;
    computedStyle: CSSStyleDeclaration;
    context: Context;


    constructor(target: any, context: Context) {

        this.target = target;
        this.context = context;
        this.init();
    }

    init() {
        this.type = is.dom(this.target)? "dom" : "object";
        if (this.type === "dom") {
            this.inlineStyle = this.target.style;
            this.computedStyle = window.getComputedStyle(this.target);
        }
    }

    getExistingValue(prop: any): any {
        let res: any;
        if (this.type === "object" || is.propDirect(prop)) {
            return this.target[prop];
        } else {
            if (is.propTransform(prop))
                prop = "transform";
            else if (is.propFilter(prop))
                prop = "filter";
        }

        if (this.inlineStyle) {
            res = this.inlineStyle[prop];
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
            this.inlineStyle[prop] = val;
        } else {
            this.target[prop] = val;
        }
    }

}