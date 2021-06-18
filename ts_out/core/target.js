import { is } from "../util/util";
export default class Target {
    constructor(target, type, inlineStyle, computedStyle, context) {
        this.target = target;
        this.type = type;
        this.inlineStyle = inlineStyle;
        this.computedStyle = computedStyle;
        this.context = context;
    }
    getExistingValue(prop) {
        let res;
        if (this.type === "object" || is.propDirect(prop)) {
            return this.target[prop];
        }
        else {
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
    setValue(prop, val) {
        if (this.type === "dom") {
            this.inlineStyle[prop] = val;
        }
        else {
            this.target[prop] = val;
        }
    }
}
