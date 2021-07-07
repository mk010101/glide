let glide: any;

export function int($glide: any) {
    glide = $glide;
}

export function shake(target: Element, options:any = null) {

    const t = options?.speed ? options.speed : 60;
    const dist = options?.distance ? options.distance : 10;
    const times = options?.times ? options.times : 4;
    const prop = options?.axis ? options.axis : "x";

    glide.to(target, t/2, {[prop]:-dist})
        .on("end", ()=> {
            glide.to(target, t, {[prop]:dist}, {repeat:times})
                .on("end", ()=> glide.to(target, t/2, {[prop]:0}));
        });
}

export function flap(target: Element, options:any = null) {

    const t = options?.speed ? options.speed : 70;
    const anlge = options?.angle ? options.angle : 20;
    const times = options?.times ? options.times : 4;
    let prop:string = "rotateY";
    if (options?.axis) {
        if (options.axis === "x")
            prop = "rotateX";
        if (options.axis === "y")
            prop = "rotateY";
        if (options.axis === "z")
            prop = "rotateZ";
    }

    glide.to(target, t/2, {[prop]:-anlge})
        .on("end", ()=> {
            glide.to(target, t, {[prop]:anlge}, {repeat:times})
                .on("end", ()=> glide.to(target, t/2, {[prop]:0}));
        });
}
