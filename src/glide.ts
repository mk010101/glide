import Context from "./core/context";
import {Animation} from "./core/animation";
import * as ease from "./util/ease";


class Glide {

    static items: Animation[] = [];
    static lastTick = 0;
    static ease = ease;
    static context: Context;
    static fx:any;


    static to(targets: any, duration: number, params: any, options: any = {}) {

        if (!Glide.context && document) Glide.setContext(document.body);
        options.context = options.context ? new Context(options.context) : Glide.context;
        //options.computeStyle = options.computeStyle !== (void 0)? options.computeStyle : Glide._computeStyle;
        let a = new Animation(targets, duration, params, options);
        Glide.items.push(a);
        return a;
    }

    static remove(targets:any) {
        if (!targets) {
            Glide.removeAll();
        } else {
            for (let i = Glide.items.length - 1; i >= 0; i--) {
                Glide.items[i].remove(targets);
            }
        }
    }

    static removeAll() {
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            Glide.items[i].remove();
        }
    }


    static tick(t: number) {
        let delta = t - Glide.lastTick;
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            let item = Glide.items[i];
            if (item.status === 1) {
                item.update(delta);
            } else if (item.status === -1) {
                Glide.items.splice(i, 1);
            }
        }
        Glide.lastTick = t;
        requestAnimationFrame(Glide.tick);
        // console.log(Glide.items.length)
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

import * as fx from "./fx/fx";
fx.int(glide);
glide.fx = fx;

// export * from "./fx/shake";






