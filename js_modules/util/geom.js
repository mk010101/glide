export function getSvg(node) {
    let parent = node;
    while (parent instanceof SVGElement) {
        if (!(parent.parentNode instanceof SVGElement)) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return parent;
}
export function getOffsetBox(svgEl, el) {
    const svg = getSvg(svgEl);
    const bbSvgEl = svgEl.getBoundingClientRect();
    const bbEl = el.getBoundingClientRect();
    const bbSvg = svg.getBoundingClientRect();
    const viewBoxStr = svg.getAttribute("viewBox");
    let arrVB = [0, 0, bbSvgEl.width, bbSvgEl.height];
    if (viewBoxStr) {
        let arr = viewBoxStr.split(" ");
        arrVB = arr.map((v) => v = parseFloat(v));
    }
    return {
        svg: {
            x: arrVB[0],
            y: arrVB[1],
            w: arrVB[2],
            h: arrVB[3],
            bbX: bbSvg.x,
            bbY: bbSvg.y,
            scaleX: bbSvg.width / arrVB[2],
            scaleY: bbSvg.height / arrVB[3],
        },
        el: {
            x: bbEl.x,
            y: bbEl.y,
            w: bbEl.width,
            h: bbEl.height,
        }
    };
}
