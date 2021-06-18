import {TargetType, TweenType, ValueType, ValueUnit} from "../types";
import {Vo} from "../core/vo";

export const regValues = /[-%\w]+[-\d.]*/gi;
export const regVUs = /[-+=.\w%]+/g;
export const regStrValues = /(([a-z].*?)\(.*?\))(?=\s([a-z].*?)\(.*?\)|\s*$)/gi;
export const regColorVal = /([rgbahsl]+\([,%a-z \d.-]+\))|#[0-9A-F]{6}/gi;
const regProp = /^[-\w]+[^( ]/gi;
const regTypes = /Null|Number|String|Object|Array/g;



function getObjType(val: any): string {
    return Object.prototype.toString.call(val);
}


export function minMax(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

export function getTargetType(val: any): "dom" | "object" {
    if (is.dom(val)) {
        return "dom";
    } else if (is.obj(val)) {
        return "object";
    }
}

export const is = {
    dom(val: any) {
        return val.nodeType
    },
    html(val: any) {
        return is.dom(val) && !is.svg(val);
    },
    svg(val: any) {
        return val instanceof SVGElement;
    },
    input(val: any) {
        return val instanceof HTMLInputElement;
    },
    tweenable(val: any) {
        return is.dom(val) || is.obj(val);
    },
    obj: function (val: any) {
        return getObjType(val).indexOf("Object") > -1;
    },
    array(val: any) {
        return Array.isArray(val);
    },
    list: function (val: any) {
        return is.array(val) || getObjType(val).indexOf("NodeList") > -1
    },
    string(val: any) {
        return typeof val === 'string';
    },
    func(val: any) {
        return typeof val === 'function';
    },
    number(val: any) {
        return getObjType(val).indexOf("Number") > -1;
    },
    hex(val: any) {
        return /#[0-9A-F]{6}/i.test(val);
    },
    rgba(val: any) {
        return /rgb[^a]*/.test(val);
    },
    rgb(val: any) {
        return /rgb/.test(val);
    },
    hsla(val: any) {
        return /hsla/.test(val);
    },
    hsl(val: any) {
        return /hsl/.test(val);
    },
    valueColor(val: any) {
        return (is.hex(val) || is.rgb(val) || is.hsl(val));
    },
    propColor(val: any) {
        return /background-color|backgroundColor|color|fill|bg/i.test(val);
    },
    propDropShadow(val: any) {
        return /drop-shadow/i.test(val);
    },
    propNumeric(val: any) {
        return /opacity|scroll/i.test(val);
    },
    propDirect(val: any) {
        return /scrollTop/i.test(val);
    },
    propRotation(val: any) {
        return /rotate|skew/i.test(val);
    },
    mixed(val: any) {
        return /gradient/i.test(val);
    },
    propTransform(val: any) {
        return (/translate|^rotate|^scale|skew|matrix|x[(xyz]+|y[(xyz]+/i.test(val));
    },
    propMatrix(val: any) {
        return (/matrix[3d]*/i.test(val));
    },
    propFilter(val: any) {
        // return (/filter/i.test(val));
        return (/filter|blur|brightness|contrast|drop-shadow|dropShadow|grayscale|hue-rotate|hueRotate|invert|opacity\(|saturate|sepia/i.test(val));
    },
    unitless(val: any) {
        return (/scale|matrix|opacity|color|background/i.test(val));
    },
    unitDegrees(val: any) {
        return (/rotate|skew/i.test(val));
    },
    valDual(val: any) {
        return (/translate\(|scale\(|skew\(/i.test(val));
    },
    unitPercent(val: any) {
        return (/invert|contrast|grayscale|saturate|sepia/i.test(val));
    },
    unitPx(val: any) {
        return !is.unitless(val) && !is.unitDegrees(val);
    },
    valueOne(val: any) {
        return (/scale|opacity/i.test(val));
    },
};

/**
 * Returns {Tween} type.
 * @param targetType
 * @param prop
 * @return {TweenType}
 */
export function getTweenType(targetType:any, prop:any):TweenType {

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

export function getValueType(val: any = null): ValueType {

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

/**
 * Returns a default unit.
 * @param prop
 */
export function getDefaultUnit(prop: string): string {

    if (is.unitDegrees(prop))
        return "deg";
    else if (is.unitPercent(prop))
        return "%";
    else if (is.unitless(prop))
        return "";

    return "px";
}

/**
 * Returns an object with parsed value, unit and increment
 * @param val
 * @return {ValueUnit}
 */
export function getValueUnit(val: string): ValueUnit {
    const increment = val.match(/-=|\+=|\*=|\/=/g);
    if (increment) increment[0] = increment[0].replace("=", "");
    val = val.replace("-=", "");

    const v: any[] = val.match(/[-.\d]+|[%\w]+/g);
    if (v.length === 1) v.push(null);
    return {
        value: parseFloat(v[0]),
        unit: v.length === 1 ? "" : v[1],
        increment: increment ? increment[0] : null
    };
}

export function getValuesUnits(val: any): ValueUnit[] {
    let vus: ValueUnit[] = [];

    let vtype = getValueType(val);

    if (vtype === "null") {
        return [{
            value: 0,
            unit: null,
            increment: null
        }];
    } else if (vtype === "number") {
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


/**
 * Creates {Vo} object
 * @param targetType
 * @param prop
 * @param val
 */
export function getVo(targetType: TargetType, prop:any, val:any) {

    let vo = new Vo();
    vo.targetType = targetType;
    vo.tweenType = getTweenType(targetType, prop);
    vo.prop = prop;

    switch (vo.tweenType) {

        case "css":
            let vus:ValueUnit[] = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.values.push(vus[i].value);
                vo.units.push(vus[i].unit);
                vo.increments.push(vus[i].increment);
            }

            break;

    }

    return vo;

}

export function parseCssTxt(txt:string) {

}







