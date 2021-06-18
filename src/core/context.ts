export default class Context {

    units: any = {
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
        turn: 1,
        deg: 1/360,
    };

    constructor(parent: Element | string) {


        this.setUnits(parent);
        //console.log(Context.convertUnits(1, "deg", "rad", this.units))
        // console.log(Context.convertUnits(100, "px", "%", this.units))
    }

    setUnits(parent: Element | string) {
        let p;
        if (typeof parent === "string") {
            p = document.querySelector(parent);
        } else if (parent && parent.nodeType === 1) {
            p = parent;
        } else {
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
        p.appendChild(el);
        const computed = window.getComputedStyle(el);
        //this.units.px = parseFloat(computed.fontSize);
        //console.log(this.units.px)

        let keys = Object.keys(this.units);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (key !== "turn" && key !== "deg" && key !== "rad") {
                el.style.width = 1 + key;
                this.units[key] = parseFloat(computed.width);
            }
        }
        //console.log(this.units);
        p.removeChild(el);
    }

    static convertUnits(val: number, from: string, to: string, units: any): number {
        let px = units[from];
        let un = units[to];
        return px / un * val;
    }

}


