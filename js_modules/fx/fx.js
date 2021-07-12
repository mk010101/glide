import { is } from "../util/regex";
let glide;
export function int($glide) {
    glide = $glide;
}
export function shake(target, options = null) {
    const t = (options === null || options === void 0 ? void 0 : options.speed) ? 1000 / options.speed : 1000 / 20;
    const dist = (options === null || options === void 0 ? void 0 : options.distance) ? options.distance : 10;
    const times = (options === null || options === void 0 ? void 0 : options.times) ? options.times : 4;
    const prop = (options === null || options === void 0 ? void 0 : options.axis) ? options.axis : "x";
    return glide.to(target, t / 2, { [prop]: -dist })
        .on("end", () => {
        glide.to(target, t, { [prop]: dist }, { repeat: times })
            .on("end", () => glide.to(target, t / 2, { [prop]: 0 }));
    });
}
export function flap(target, options = null) {
    const t = (options === null || options === void 0 ? void 0 : options.speed) ? 1000 / options.speed : 1000 / 15;
    const anlge = (options === null || options === void 0 ? void 0 : options.angle) ? options.angle : 20;
    const times = (options === null || options === void 0 ? void 0 : options.times) ? options.times : 4;
    let prop = "rotateY";
    if (options === null || options === void 0 ? void 0 : options.axis) {
        if (options.axis === "x")
            prop = "rotateX";
        if (options.axis === "y")
            prop = "rotateY";
        if (options.axis === "z")
            prop = "rotateZ";
    }
    return glide.to(target, t / 2, { [prop]: -anlge })
        .on("end", () => {
        glide.to(target, t, { [prop]: anlge }, { repeat: times })
            .on("end", () => glide.to(target, t / 2, { [prop]: 0 }));
    });
}
export class Flip {
    constructor(target, side1, side2, options = null) {
        this.prop = "rotateY";
        this.speed = 1000 / 2.5;
        this.continuous = false;
        this.deg = "+=90";
        this.originalStyle = "block";
        this.target = getElement(target);
        this.side1 = getElement(side1);
        this.side2 = getElement(side2);
        this.side2.style.display = "none";
        this.continuous = (options === null || options === void 0 ? void 0 : options.continuous) != void 0 ? options.continuous : false;
        this.speed = (options === null || options === void 0 ? void 0 : options.speed) != void 0 ? 1000 / options.speed : this.speed;
        this.originalStyle = window.getComputedStyle(this.side1).display;
        if ((options === null || options === void 0 ? void 0 : options.axis) === "x")
            this.prop = "rotateX";
        else if ((options === null || options === void 0 ? void 0 : options.axis) === "y")
            this.prop = "rotateY";
        if (this.prop === "rotateX") {
            this.side2.style.transform = "scale(1, -1)";
        }
        else {
            this.side2.style.transform = "scale(-1, 1)";
        }
    }
    flip() {
        this.target.style.pointerEvents = "none";
        glide.to(this.target, this.speed, { [this.prop]: this.deg }, { ease: "quadIn" })
            .on("end", () => {
            this.side1.style.display = "none";
            this.side2.style.display = this.originalStyle;
            glide.to(this.target, this.speed, { [this.prop]: this.deg }, { ease: "quadOut" })
                .on("end", () => {
                let tmp = this.side2;
                this.side2 = this.side1;
                this.side1 = tmp;
                if (!this.continuous) {
                    this.deg = this.deg === "+=90" ? "-=90" : "+=90";
                }
                this.target.style.pointerEvents = "";
            });
        });
    }
}
function getElement(el) {
    if (is.string(el))
        return document.querySelector(el);
    else if (is.dom(el))
        return el;
}
