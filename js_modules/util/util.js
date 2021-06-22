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
        if (res.length === 1)
            res.push(res[0]);
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
    vo.targetType = targetType;
    vo.tweenType = getTweenType(targetType, prop);
    vo.prop = prop;
    vo.isNumber = targetType === "obj";
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
            vo.values = getNumbers(val);
            for (let i = 0; i < vo.values.length; i++) {
                vo.units.push("");
            }
            vo.strBegin = vo.values.length === 4 ? "rgba" : "rgb";
            break;
        case "dropShadow":
            if (!val)
                val = "0px 0px 0px #cccccc";
            let rgb = val.match(regColorVal)[0];
            val = val.replace(rgb, "");
            let pa = getValuesUnits(val);
            for (let i = 0; i < pa.length; i++) {
                vo.values.push(pa[i].value);
                vo.units.push(pa[i].unit);
                vo.increments.push(pa[i].increment);
            }
            let rgbs = toRgb(rgb);
            vo.values = vo.values.concat(...rgbs);
            break;
        case "matrix":
            if (!val) {
                vo.values = [1, 0, 0, 1, 0, 0];
                vo.units = ["", "", "", "", "", ""];
            }
            else {
                vo.values = getNumbers(val);
                vo.units = ["", "", "", "", "", ""];
            }
            break;
        case "other":
            let vus = getValuesUnits(val);
            for (let i = 0; i < vus.length; i++) {
                vo.values.push(vus[i].value);
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
        if (!from.isNumber) {
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
        to.diffVals.push(to.values[i] - from.values[i]);
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
        vo.keepOriginal = true;
        vo.keepStr = part;
        let tw = new Tween(null, "transform", vo.prop, null, null, 0, 0, 0);
        tw.from = vo;
        res.set(vo.prop, tw);
    }
    return res;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
