import {is} from "../util/regex";

let glide: any;

export function int($glide: any) {
    glide = $glide;
}

/**
 * Shakes element on x or y axis.
 * @param target
 * @param options
 */
export function shake(target: Element, options: any = null) {

    const t = options?.speed ? 1000 / options.speed : 1000 / 20;
    const dist = options?.distance ? options.distance : 10;
    const times = options?.times ? options.times : 4;
    const prop = options?.axis ? options.axis : "x";

    return  glide.to(target, t / 2, {[prop]: -dist})
        .on("end", () => {
            glide.to(target, t, {[prop]: dist}, {repeat: times})
                .on("end", () => glide.to(target, t / 2, {[prop]: 0}));
        });

}


/**
 * Flaps element around one of its axis (x, y, z).
 * @param target
 * @param options
 */
export function flap(target: Element, options: any = null) {

    const t = options?.speed ? 1000 / options.speed : 1000 / 15;
    const anlge = options?.angle ? options.angle : 20;
    const times = options?.times ? options.times : 4;
    let prop: string = "rotateY";
    if (options?.axis) {
        if (options.axis === "x")
            prop = "rotateX";
        if (options.axis === "y")
            prop = "rotateY";
        if (options.axis === "z")
            prop = "rotateZ";
    }

    return glide.to(target, t / 2, {[prop]: -anlge})
        .on("end", () => {
            glide.to(target, t, {[prop]: anlge}, {repeat: times})
                .on("end", () => glide.to(target, t / 2, {[prop]: 0}));
        });
}

/**
 * Flips element with 2 sides on x or y axis.
 */
export class Flip {

    target: HTMLElement;
    side1: HTMLElement;
    side2: HTMLElement;
    prop = "rotateY";
    speed = 1000 / 2.5;
    continuous = false;
    deg = "+=90";
    originalStyle = "block";
    //this.pointerEvt = ""

    /**
     * Constructor
     * @param target
     * @param side1
     * @param side2
     * @param options: continuous:bool, time:number, axis:string('x' or 'y')
     */
    constructor(target: any, side1: any, side2: any, options: any = null) {
        this.target = getElement(target);
        this.side1 = getElement(side1);
        this.side2 = getElement(side2);
        this.side2.style.display = "none";

        this.continuous = options?.continuous != void 0 ? options.continuous : false;
        this.speed = options?.speed != void 0 ? 1000/options.speed : this.speed;
        this.originalStyle = window.getComputedStyle(this.side1).display;

        if (options?.axis === "x")
            this.prop = "rotateX";
        else if (options?.axis === "y")
            this.prop = "rotateY";

        if (this.prop === "rotateX") {
            this.side2.style.transform = "scale(1, -1)";
        } else {
            this.side2.style.transform = "scale(-1, 1)";
        }

    }

    flip() {
        this.target.style.pointerEvents = "none";
        glide.to(this.target, this.speed, {[this.prop]: this.deg}, {ease: "quadIn"})
            .on("end", () => {
                this.side1.style.display = "none";
                this.side2.style.display = this.originalStyle;
                glide.to(this.target, this.speed, {[this.prop]: this.deg}, {ease: "quadOut"})
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



function getElement(el:any) {

    if (is.string(el))
        return document.querySelector(el);
    else if (is.dom(el))
        return el;

}







