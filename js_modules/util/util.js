import { Vo } from "../core/vo";
import Context from "../core/context";
export const regValues = /[-%\w]+[-\d.]*/gi;
export const regVUs = /[-+=.\w%]+/g;
export const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
export const regColorVal = /([rgbahsl]+\([,%a-z \d.-]+\))|#[0-9A-F]{6}/gi;
const regProp = /^[-\w]+[^( ]/gi;
const regTypes = /Null|Number|String|Object|Array/g;
function getObjType(val) {
    return Object.prototype.toString.call(val);
}
export function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}
export function getTargetType(val) {
    if (is.dom(val)) {
        return "dom";
    }
    else if (is.obj(val)) {
        return "object";
    }
}
export const is = {
    dom(val) {
        return val.nodeType;
    },
    html(val) {
        return is.dom(val) && !is.svg(val);
    },
    svg(val) {
        return val instanceof SVGElement;
    },
    input(val) {
        return val instanceof HTMLInputElement;
    },
    tweenable(val) {
        return is.dom(val) || is.obj(val);
    },
    obj: function (val) {
        return getObjType(val).indexOf("Object") > -1;
    },
    array(val) {
        return Array.isArray(val);
    },
    list: function (val) {
        return is.array(val) || getObjType(val).indexOf("NodeList") > -1;
    },
    string(val) {
        return typeof val === 'string';
    },
    func(val) {
        return typeof val === 'function';
    },
    number(val) {
        return getObjType(val).indexOf("Number") > -1;
    },
    hex(val) {
        return /#[0-9A-F]{6}/i.test(val);
    },
    rgba(val) {
        return /rgb[^a]*/.test(val);
    },
    rgb(val) {
        return /rgb/.test(val);
    },
    hsla(val) {
        return /hsla/.test(val);
    },
    hsl(val) {
        return /hsl/.test(val);
    },
    valueColor(val) {
        return (is.hex(val) || is.rgb(val) || is.hsl(val));
    },
    propColor(val) {
        return /background-color|backgroundColor|color|fill|bg/i.test(val);
    },
    propDropShadow(val) {
        return /drop-shadow/i.test(val);
    },
    propNumeric(val) {
        return /opacity|scroll/i.test(val);
    },
    propDirect(val) {
        return /scrollTop/i.test(val);
    },
    propRotation(val) {
        return /rotate|skew/i.test(val);
    },
    mixed(val) {
        return /gradient/i.test(val);
    },
    propTransform(val) {
        return (/translate|^rotate|^scale|skew|matrix|x[(xyz]+|y[(xyz]+/i.test(val));
    },
    propMatrix(val) {
        return (/matrix[3d]*/i.test(val));
    },
    propFilter(val) {
        return (/filter|blur|brightness|contrast|drop-shadow|dropShadow|grayscale|hue-rotate|hueRotate|invert|opacity\(|saturate|sepia/i.test(val));
    },
    unitless(val) {
        return (/scale|matrix|opacity|color|background/i.test(val));
    },
    unitDegrees(val) {
        return (/rotate|skew/i.test(val));
    },
    valDual(val) {
        return (/translate\(|scale\(|skew\(/i.test(val));
    },
    unitPercent(val) {
        return (/invert|contrast|grayscale|saturate|sepia/i.test(val));
    },
    unitPx(val) {
        return !is.unitless(val) && !is.unitDegrees(val);
    },
    valueOne(val) {
        return (/scale|opacity/i.test(val));
    },
};
export function getTweenType(targetType, prop) {
    if (is.obj(targetType))
        return "obj";
    else if (is.propTransform(prop))
        return "transform";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propColor(prop))
        return "color";
    else if (is.propDirect(prop))
        return "direct";
    return "css";
}
export function getValueType(val = null) {
    let t = getObjType(val).match(regTypes)[0];
    switch (t) {
        case "Null":
            return "null";
        case "Number":
            return "number";
        case "String":
            return "string";
    }
    return;
}
export function getDefaultUnit(prop) {
    if (is.unitDegrees(prop))
        return "deg";
    else if (is.unitPercent(prop))
        return "%";
    else if (is.unitless(prop))
        return "";
    return "px";
}
export function getValueUnit(val) {
    const increment = val.match(/-=|\+=|\*=|\/=/g);
    if (increment)
        increment[0] = increment[0].replace("=", "");
    val = val.replace("-=", "");
    const v = val.match(/[-.\d]+|[%\w]+/g);
    if (v.length === 1)
        v.push(null);
    return {
        value: parseFloat(v[0]),
        unit: v.length === 1 ? "" : v[1],
        increment: increment ? increment[0] : null
    };
}
export function getValuesUnits(val) {
    let vus = [];
    let vtype = getValueType(val);
    if (vtype === "null") {
        return [{
                value: 0,
                unit: null,
                increment: null
            }];
    }
    else if (vtype === "number") {
        return [{
                value: val,
                unit: null,
                increment: null
            }];
    }
    let arr = val.match(regVUs);
    for (let i = 0; i < arr.length; i++) {
        vus.push(getValueUnit(arr[i]));
    }
    return vus;
}
export function getVo(targetType, prop, val) {
    let vo = new Vo();
    vo.targetType = targetType;
    vo.tweenType = getTweenType(targetType, prop);
    vo.prop = prop;
    switch (vo.tweenType) {
        case "css":
            let vus = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.values.push(vus[i].value);
                vo.units.push(vus[i].unit);
                vo.increments.push(vus[i].increment);
            }
            break;
    }
    return vo;
}
export function normalizeVos(from, to, context) {
    const prop = from.prop;
    if (prop === "drop-shadow") {
        if (from.values.length > to.values.length)
            to.values.push(1);
        else if (from.values.length < to.values.length)
            from.values.push(1);
    }
    if (to.units.length > from.units.length) {
        let diff = to.units.length - from.units.length;
        for (let i = 0; i < diff; i++) {
            from.units.push(null);
            let v = is.valueOne(to.prop) ? 1 : 0;
            from.values.push(v);
        }
    }
    for (let i = 0; i < from.units.length; i++) {
        let uFrom = from.units[i];
        let uTo = to.units[i];
        let incr = to.increments[i];
        if (!uFrom)
            uFrom = from.units[i] = getDefaultUnit(from.prop);
        if (!uTo)
            uTo = to.units[i] = uFrom;
        if (uFrom && uFrom !== uTo) {
            if (is.propTransform(from.prop) && (uFrom === "%" && uTo !== "%" || uFrom !== "%" && uTo === "%")) {
            }
            else {
                from.values[i] = Context.convertUnits(from.values[i], uFrom, uTo, context.units);
            }
        }
        if (incr === "-") {
            to.values[i] = from.values[i] - to.values[i];
        }
        else if (incr === "+") {
            to.values[i] += from.values[i];
        }
        else if (incr === "*") {
            to.values[i] *= from.values[i];
        }
        else if (incr === "/") {
            to.values[i] /= from.values[i];
        }
    }
}
export function parseCssTxt(txt) {
}
