let glide;
export function int($glide) {
    glide = $glide;
}
export function shake(target, options = null) {
    const t = (options === null || options === void 0 ? void 0 : options.speed) ? options.speed : 60;
    const dist = (options === null || options === void 0 ? void 0 : options.distance) ? options.distance : 10;
    const times = (options === null || options === void 0 ? void 0 : options.times) ? options.times : 4;
    const prop = (options === null || options === void 0 ? void 0 : options.axis) ? options.axis : "x";
    glide.to(target, t / 2, { [prop]: -dist })
        .on("end", () => {
        glide.to(target, t, { [prop]: dist }, { repeat: times })
            .on("end", () => glide.to(target, t / 2, { [prop]: 0 }));
    });
}
export function flap(target, options = null) {
    const t = (options === null || options === void 0 ? void 0 : options.speed) ? options.speed : 70;
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
    glide.to(target, t / 2, { [prop]: -anlge })
        .on("end", () => {
        glide.to(target, t, { [prop]: anlge }, { repeat: times })
            .on("end", () => glide.to(target, t / 2, { [prop]: 0 }));
    });
}
