import { getObjType, is, regColorVal, regProp, regStrValues, regTypes, regValues, regVUs } from "./regex";
import { Vo } from "../core/vo";
import { toRgb, toRgbStr } from "./color";
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
export function getVo(targetType, prop, val) {
    let vo = new Vo();
    let propType = getPropType(prop);
    if (targetType === "dom" && is.valueOne(prop)) {
        if (val == void 0)
            val = 1;
    }
    switch (propType) {
        case "color":
            let colorMatch = val.match(regColorVal);
            let color;
            if (colorMatch) {
                color = toRgbStr(colorMatch[0]);
                val = val.replace(colorMatch[0], color);
            }
            vo.numbers = getNumbers(val);
            for (let i = 0; i < vo.numbers.length; i++) {
                vo.units.push("");
            }
            break;
        case "dropShadow":
            if (!val)
                val = "0px 0px 0px #cccccc";
            let rgb = val.match(regColorVal)[0];
            val = val.replace(rgb, "");
            let pa = getValuesUnits(val);
            for (let i = 0; i < pa.length; i++) {
                vo.numbers.push(pa[i].value);
                vo.units.push(pa[i].unit);
                vo.increments.push(pa[i].increment);
            }
            let rgbs = toRgb(rgb);
            vo.numbers = vo.numbers.concat(...rgbs);
            break;
        case "matrix":
            if (!val) {
                vo.numbers = [1, 0, 0, 1, 0, 0];
                vo.units = ["", "", "", "", "", ""];
            }
            else {
                vo.numbers = getNumbers(val);
                vo.units = ["", "", "", "", "", ""];
            }
            break;
        case "other":
            let vus = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.numbers.push(vus[i].value);
                let unit = targetType === "dom" ? vus[i].unit : null;
                vo.units.push(unit);
                vo.increments.push(vus[i].increment);
            }
    }
    return vo;
}
function getVoFromStr(str) {
    let prop = str.match(regProp)[0];
    str = str.replace(prop, "");
    return getVo("dom", prop, str);
}
export function normalizeTween(tw, context) {
    const prop = tw.prop;
    const from = tw.from;
    const to = tw.to;
    if (prop === "drop-shadow") {
        if (tw.from.numbers.length > to.numbers.length)
            to.numbers.push(1);
        else if (from.numbers.length < to.numbers.length)
            from.numbers.push(1);
    }
    let longer = to.units.length > from.units.length ? to : from;
    let shorter = longer === from ? to : from;
    for (let i = 0; i < longer.units.length - shorter.units.length; i++) {
        shorter.units.push(null);
        let v = is.valueOne(tw.prop) ? 1 : 0;
        shorter.numbers.push(v);
    }
    for (let i = 0; i < from.units.length; i++) {
        let uFrom = from.units[i];
        let uTo = to.units[i];
        let incr = to.increments[i];
        if (!tw.isNum) {
            if (!uFrom)
                uFrom = from.units[i] = getDefaultUnit(tw.prop);
            if (!uTo)
                uTo = to.units[i] = uFrom;
            if (uFrom && uFrom !== uTo) {
                if (is.propTransform(tw.prop) && (uFrom === "%" && uTo !== "%" || uFrom !== "%" && uTo === "%")) {
                }
                else {
                    from.numbers[i] = Context.convertUnits(from.numbers[i], uFrom, uTo, context.units);
                }
            }
        }
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
export function strToMap(str) {
    let res = new Map();
    if (!str || str === "" || str === "none")
        return null;
    let arr = str.match(regStrValues);
    if (!arr)
        return null;
    for (let i = 0; i < arr.length; i++) {
        let part = arr[i];
        let vo = getVoFromStr(part);
        let tw = new Tween("transform", "prop", null, null, 0, 0, 0);
        tw.from = vo;
        res.set(tw.prop, tw);
    }
    return res;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
