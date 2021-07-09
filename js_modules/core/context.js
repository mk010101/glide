const PI = Math.PI;
function degToRad(val) {
    return val * PI / 180;
}
function radToDeg(val) {
    return val / PI * 180;
}
export default class Context {
    constructor(parent) {
        this.units = {
            px: 16,
            em: 1,
            rem: 1,
            vw: 1,
            vh: 1,
            vmin: 1,
            vmax: 1,
            cm: 1,
            mm: 1,
            in: 1,
            pt: 1,
            pc: 1,
            "%": 1,
        };
        this.setUnits(parent);
    }
    setUnits(parent) {
        let p;
        if (typeof parent === "string") {
            p = document.querySelector(parent);
        }
        else if (parent && parent.nodeType === 1) {
            p = parent;
        }
        else {
            p = undefined;
        }
        if (!p) {
            console.warn(`Glide.Context: parent "${parent}" could not be found.`);
            return;
        }
        let el = document.createElement("div");
        el.style.position = "relative";
        el.style.visibility = "invisible";
        el.style.width = "1px";
        el.style.height = "1px";
        p.appendChild(el);
        const computed = window.getComputedStyle(el);
        let keys = Object.keys(this.units);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            el.style.width = 1 + key;
            this.units[key] = parseFloat(computed.width);
        }
        p.removeChild(el);
    }
    static convertUnits(val, from, to, units) {
        if (from === "deg" && to === "rad")
            return val * PI / 180;
        else if (from === "rad" && to === "deg")
            return val / PI * 180;
        if (from === "deg" && to === "rad")
            return val * PI / 180;
        else if (from === "turn" && to === "deg")
            return val * 360;
        if (from === "deg" && to === "turn")
            return val / 360;
        let px = units[from];
        let un = units[to];
        return px / un * val;
    }
}
