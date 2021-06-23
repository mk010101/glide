import { is } from "../util/regex";
export default class Target {
    constructor(target, context) {
        this.pos = 0;
        this.el = target;
        this.context = context;
        this.init();
    }
    init() {
        this.type = is.dom(this.el) ? "dom" : "obj";
        if (this.type === "dom") {
            this.style = this.el.style;
            this.tweenable = this.style;
            this.computedStyle = window.getComputedStyle(this.el);
        }
        else {
            this.tweenable = this.el;
        }
    }
    getExistingValue(prop) {
        let res;
        if (this.type === "obj" || is.propDirect(prop)) {
            return this.el[prop];
        }
        else {
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
    setValue(prop, val) {
        if (this.type === "dom") {
            this.style[prop] = val;
        }
        else {
            this.el[prop] = val;
        }
    }
}
