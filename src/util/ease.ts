export function  powerInOut(pow: number) {
    return function (t: number) {
        if ((t *= 2) < 1) return 0.5 * Math.pow(t, pow);
        return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
    };
}

export function  powerIn(pow: number) {
    return function (t: number) {
        return Math.pow(t, pow);
    };
}

export function  powerOut(pow: number) {
    return function (t: number) {
        return 1 - Math.pow(1 - t, pow);
    };
}


export function  getBackIn(s: number = 1.70158) {
    return function (t: number = 0.0) {
        return t * t * ((s + 1) * t - s);
    }
}

export function  getBackOut(s: number = 1.70158) {
    return function (t: number = 0.0) {
        return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    }
}

export function  getBackInOut(s: number = 1.70158) {
    return function (t: number = 0.0) {
        if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }
}

export function  getElasticIn(period: number = 0.3, amplitude: number = 1.70158) {
    return function (t: number) {
        let a = 1;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (!period) period = 0.3;
        if (a < 1) {
            a = 1;
            amplitude = period / 4;
        } else amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period));
    };
}

export function  getElasticOut(period: number = 0.3, amplitude: number = 1.70158) {
    return function (t: number) {
        let a = 1;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (a < 1) {
            a = 1;
            amplitude = period / 4;
        } else amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t - amplitude) * (2 * Math.PI) / period) + 1;
    };
}


export function  getElasticInOut(period: number = 0.45, amplitude: number = 1.70158) {
    return function (t: number) {
        let a = 1;
        if (t === 0) return 0;
        if ((t /= 1 / 2) === 2) return 1;
        if (a < 1) {
            a = 1;
            amplitude = period / 4;
        } else amplitude = period / (2 * Math.PI) * Math.asin(1 / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period));
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - amplitude) * (2 * Math.PI) / period) * 0.5 + 1;
    };
}


export function  linear(t: number = 0.0) {
    return t;
}


export function  quadIn(t: number = 0.0) {
    return t * t;
}

export function  quadOut(t: number = 0.0) {
    return t * (2 - t);
}

export function  quadInOut(t: number = 0.0) {
    if (t < 0.5) return 2.0 * t * t;
    else return -1.0 + (4.0 - 2.0 * t) * t;
}


export const  cubicIn = powerIn(3);

export const  cubicOut = powerOut(3);

export const  cubicInOut = powerInOut(3);

export const  backIn = getBackIn();

export const  backOut = getBackOut();

export const  backInOut = getBackInOut();

export const  elasticIn = getElasticIn();

export const  elasticOut = getElasticOut();

export const  elasticInOut = getElasticInOut();


export function  circleIn(t: number = 0.0) {
    return -1 * (Math.sqrt(1 - t * t) - 1);
}

export function  circleOut(t: number = 0.0) {
    return Math.sqrt(1 - (t = t - 1) * t);
}

export function  circleInOut(t: number = 0.0) {
    if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
    return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}


export function  expoIn(t: number = 0.0) {
    return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
}

export function  expoOut(t: number = 0.0) {
    return (t === 1) ? 1 : (-Math.pow(2, -10 * t) + 1);
}

export function  expoInOut(t: number = 0.0) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
    return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
}


export function  bounceIn(t: number) {
    return 1 - bounceOut(1 - t);
}


export function  bounceOut(t: number) {
    if (t < 1 / 2.75) {
        return (7.5625 * t * t);
    } else if (t < 2 / 2.75) {
        return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    } else if (t < 2.5 / 2.75) {
        return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    } else {
        return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
    }
}

export function  bounceInOut(t: number) {
    if (t < 0.5) return bounceIn(t * 2) * .5;
    return bounceOut(t * 2 - 1) * 0.5 + 0.5;
}



export function  stepped(steps: number = 5) {

    return function (t: number) {

        if (t <= 0)
        {
            return 0;
        }
        else if (t >= 1)
        {
            return 1;
        }
        else
        {
            //return (((steps * t) | 0) + 1) * (1 / steps); /// steps immediately.
            return ((steps * t) | 0) * (1 / steps);
        }
    }

}









