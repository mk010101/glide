import Context from "./core/context";
import { Animation } from "./core/animation";
import * as ease from "./util/ease";
class Glide {
    static to(targets, duration, params, options = {}) {
        if (!Glide.context && document)
            Glide.setContext(document.body);
        options.context = options.context ? new Context(options.context) : Glide.context;
        let a = new Animation(targets, duration, params, options);
        Glide.items.push(a);
        return a;
    }
    static removeAll() {
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            Glide.items[i].remove();
        }
    }
    static tick(t) {
        let delta = t - Glide.lastTick;
        for (let i = Glide.items.length - 1; i >= 0; i--) {
            let item = Glide.items[i];
            if (item.status === 1) {
                item.update(delta);
            }
            else if (item.status === -1) {
                Glide.items.splice(i, 1);
            }
        }
        Glide.lastTick = t;
        requestAnimationFrame(Glide.tick);
    }
    static setContext(parent) {
        Glide.context = new Context(parent);
    }
}
Glide.items = [];
Glide.lastTick = 0;
Glide.ease = ease;
Glide.tick(performance.now());
const glide = Glide;
export default glide;
import * as fx from "./fx/fx";
fx.int(glide);
glide.fx = fx;
