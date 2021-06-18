import { is } from "../util/util";
export default class Target {
    constructor(target, context) {
        this.target = target;
        this.context = context;
        this.init();
    }
    init() {
        this.type = is.dom(this.target) ? "dom" : "obj";
        if (this.type === "dom") {
            this.inlineStyle = this.target.style;
            this.computedStyle = window.getComputedStyle(this.target);
        }
    }
    getExistingValue(prop) {
        let res;
        if (this.type === "obj" || is.propDirect(prop)) {
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
