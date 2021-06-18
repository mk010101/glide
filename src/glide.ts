

class Glide {

    static items: Animation[] = [];
    static lastTick = 0;
    static ease = ease;
    static context: Context;
    static _computeStyle = true;


    static to(targets: any, duration: number, params: any, options: any = {}) {

        if (!Glide.context && document) Glide.setContext(document.body);
        options.context = options.context ? new Context(options.context) : Glide.context;
        options.computeStyle = options.computeStyle !== (void 0)? options.computeStyle : Glide._computeStyle;
        let a = new Animation(targets, duration, params, options);
        Glide.items.push(a);
        return a;
    }


    static tick(t: number) {
        let delta = t - Glide.lastTick;
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            let item = Glide.items[i];
            if (item.status === 1) {
                item.update(delta);
            } else if (item.status === 0) {
                Glide.items.splice(i, 1);
            }
        }
        Glide.lastTick = t;
        requestAnimationFrame(Glide.tick);
    }

    /**
     * Sets context for unit conversions.
     * @param parent element or string
     */
    static setContext(parent: any) {
        Glide.context = new Context(parent);
    }


}

Glide.tick(performance.now());

const glide = Glide;
export default glide;
