
export function getSvg(node:Element):Element {
    let parent = node;
    while (parent instanceof SVGElement) {
        if (!(parent.parentNode instanceof SVGElement)) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return parent;
}
