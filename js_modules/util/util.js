import { getObjType, is, regColorVal, regNums, regProp, regStrValues, regTypes, regValues, regVUs } from "./regex";
import { Vo } from "../core/vo";
import { toRgbStr } from "./color";
import Context from "../core/context";
import { Tween } from "../core/tween";
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
export function getTweenType(targetType, prop) {
    if (is.obj(targetType))
        return "obj";
    else if (is.propTransform(prop))
        return "transform";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propDirect(prop))
        return "direct";
    return "other";
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
export function getPropType(prop) {
    if (is.propDropShadow(prop))
        return "dropShadow";
    else if (is.propColor(prop))
        return "color";
    else if (is.propMatrix(prop))
        return "matrix";
    return "other";
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
function getNumbers(val) {
    let nums = val.match(/[-.\d]+/g);
    return nums.map((v) => parseFloat(v));
}
export function unwrapValues(prop, val) {
    const propX = prop + "X";
    const propY = prop + "Y";
    if (is.number(val)) {
        return [
            { prop: propX, val: val },
            { prop: propY, val: val }
        ];
    }
    else if (is.string(val)) {
        let res = val.match(regValues);
        if (res.length === 1) {
            res.push(is.valueOne(prop) ? "1" : "0");
        }
        return [
            { prop: propX, val: res[0] },
            { prop: propY, val: res[1] }
        ];
    }
    else if (is.array(val)) {
        if (val.lengh === 1)
            val.push(val[0]);
        return [
            { prop: propX, val: val[0] },
            { prop: propY, val: val[1] }
        ];
    }
}
function getBeginStr(prop) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return prop + "(";
    return "";
}
function getEndStr(prop) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return ")";
    return "";
}
function getSepStr(prop) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return ", ";
    return " ";
}
export function getVo(targetType, prop, val) {
    let vo = new Vo();
    let propType = getPropType(prop);
    if (is.number(val)) {
        vo.numbers = [val];
        vo.units = [null];
        vo.increments = [null];
        return vo;
    }
    if (is.string(val) && is.valueColor(val)) {
        let colorMatch = val.match(regColorVal);
        if (colorMatch) {
            let color;
            color = toRgbStr(colorMatch[0]);
            val = val.replace(colorMatch, "");
            val = color + " " + val;
        }
    }
    switch (propType) {
        case "color":
            vo.numbers = getNumbers(val);
            vo.strings = val.split(regNums);
            vo.floats.push(0, 0, 0);
            if (vo.numbers.length === 4)
                vo.floats.push(1);
            for (let i = 0; i < vo.numbers.length; i++) {
                vo.increments.push(null);
            }
            break;
        default:
            let vus = getValuesUnits(val);
            vo.strings.push(getBeginStr(prop));
            let separator = getSepStr(prop);
            for (let i = 0; i < vus.length; i++) {
                vo.numbers.push(vus[i].value);
                vo.units.push(vus[i].unit);
                vo.increments.push(vus[i].increment);
                vo.floats.push(1);
            }
            for (let i = 1; i < vo.numbers.length; i++) {
                vo.strings.push(separator);
            }
            vo.strings.push(getEndStr(prop));
    }
    return vo;
}
export function normalizeTween(tw, context) {
    const prop = tw.prop;
    const from = tw.from;
    const to = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop);
    if (from.numbers.length !== to.numbers.length) {
        let shorter = from.numbers.length > to.numbers.length ? to : from;
        let longer = shorter === from ? to : from;
        let diff = longer.numbers.length - shorter.numbers.length;
        shorter.strings = longer.strings;
        for (let i = 0; i < diff; i++) {
            if (shorter === from) {
                shorter.units.push(shorter.units[0]);
            }
            else {
                to.units.push(to.units[to.units.length - 1]);
                to.increments.push(to.increments[to.increments.length - 1]);
            }
            switch (propType) {
                case "color":
                    shorter.numbers.push(1);
                    break;
                case "transform":
                    break;
                case "other":
                    shorter.numbers.push(shorter.numbers[0]);
                    break;
            }
        }
    }
    if (from.strings.length > to.strings.length)
        to.strings = from.strings;
    for (let i = 0; i < to.numbers.length; i++) {
        if (to.units[i] == (void 0)) {
            to.units[i] = from.units[i];
        }
        if (from.units[i] !== to.units[i]) {
            from.numbers[i] = Context.convertUnits(from.numbers[i], from.units[i], to.units[i], context.units);
        }
        if (to.units[i] == (void 0)) {
            to.units[i] = defaultUnit;
        }
        let incr = to.increments[i];
        if (incr === "-") {
            to.numbers[i] = from.numbers[i] - to.numbers[i];
        }
        else if (incr === "+") {
            to.numbers[i] += from.numbers[i];
        }
        else if (incr === "*") {
            to.numbers[i] *= from.numbers[i];
        }
        else if (incr === "/") {
            to.numbers[i] /= from.numbers[i];
        }
    }
}
export function strToMap(str, twType) {
    let res = new Map();
    if (!str || str === "" || str === "none")
        return null;
    let arr = str.match(regStrValues);
    if (!arr)
        return null;
    for (let i = 0; i < arr.length; i++) {
        let part = arr[i];
        let prop = part.match(regProp)[0];
        part = part.replace(prop, "");
        let vo = getVo("dom", prop, part);
        let tw = new Tween(twType, prop, null, null, 0, 0, 0);
        tw.from = vo;
        tw.keepOld = true;
        tw.oldValue = prop + part;
        res.set(tw.prop, tw);
    }
    return res;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
