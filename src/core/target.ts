import Context from "./context";
import {is} from "../util/util";

export default class Target {

    target: any;
    type: "dom" | "object";
    inlineStyle: CSSStyleDeclaration;
    computedStyle: CSSStyleDeclaration;
    context: Context;
    delay: number;


    constructor(target: any,
                type: "dom" | "object",
                inlineStyle: CSSStyleDeclaration,
                computedStyle: CSSStyleDeclaration,
                context: Context
    ) {
        this.target = target;
        this.type = type;
        this.inlineStyle = inlineStyle;
        this.computedStyle = computedStyle;
        this.context = context;
    }

    getExistingValue(prop: any): any {
        let res:any;
        if (this.type === "object" || is.propDirect(prop)) {
            return this.target[prop];
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