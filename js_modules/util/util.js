import { getObjType, is, regColors, regProp, regStrValues, regTypes, regValues, regVUs } from "./regex";
import { Vo } from "../core/vo";
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
    if (is.propTransform(prop))
        return "transform";
    else if (is.propColor(prop))
        return "color";
    else if (is.propFilter(prop))
        return "filter";
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
export function getDefaultValue(prop) {
    if (is.valueOne(prop))
        return 1;
    return 0;
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
function getDefaultVo(prop = null) {
    let val = prop ? getDefaultValue(prop) : 0;
    let vo = new Vo();
    vo.numbers.push(val);
    vo.strings.push(null);
    vo.units.push(null);
    vo.increments.push(null);
    return vo;
}
export function getVo(targetType, prop, val) {
    let res = new Vo();
    let propType = getPropType(prop);
    if (val === undefined) {
        return getDefaultVo(prop);
    }
    else if (is.number(val)) {
        let vo = getDefaultVo();
        vo.numbers = [val];
        return vo;
    }
    let arrColors = val.match(regColors);
    let arrCombined = [];
    if (arrColors) {
        let strParts = val.split(regColors);
        arrCombined = recombineNumsAndStrings(arrColors, strParts);
    }
    else {
        arrCombined = [val];
    }
    for (let i = 0; i < arrCombined.length; i++) {
        let p = arrCombined[i];
        if (p === "")
            continue;
        res.push(...getVUs(p));
    }
    for (let i = 0; i < res.length; i++) {
        if (res[i].number == (void 0) && res[i].string === "") {
            res.splice(i, 1);
        }
    }
    if (propType === "transform" || propType === "filter") {
        let begin = new Vo();
        let end = new Vo();
        begin.string = prop + "(";
        end.string = ")";
        res.unshift(begin);
        res.push(end);
    }
    return res;
}
function getVUs(str) {
    let res = [];
    if (!regVUs.test(str) && !regColors.test(str)) {
        res.push(str);
    }
    else if (regColors.test(str)) {
        let cols = getVUsArr(str);
        let count = 0;
        for (let i = 0; i < cols.length; i++) {
            res.push(cols[i]);
        }
    }
    else {
        let others = getVUsArr(str);
        res.push(...others);
    }
    return res;
}
function getVUsArr(str) {
    let resNums = [];
    let resStr = [];
    let res = [];
    let nums = str.match(regVUs);
    if (nums) {
        let strings = str.split(regVUs);
        for (let i = 0; i < nums.length; i++) {
            resNums.push(nums[i]);
        }
        for (let i = 0; i < strings.length; i++) {
            resStr.push(strings[i]);
        }
    }
    while (resNums.length > 0 || resStr.length > 0) {
        if (resStr.length > 0)
            res.push(resStr.shift());
        if (resNums.length > 0)
            res.push(resNums.shift());
    }
    return res;
}
function recombineNumsAndStrings(numArr, strArr) {
    let res = [];
    while (numArr.length > 0 || strArr.length > 0) {
        if (strArr.length > 0)
            res.push(strArr.shift());
        if (numArr.length > 0)
            res.push(numArr.shift());
    }
    return res;
}
export function normalizeTween(tw, context) {
    const prop = tw.prop;
    if (prop === "background")
        return;
    let froms = tw.from;
    let tos = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop);
    const defaultValue = getDefaultValue(prop);
    if (froms.length === 1 && !froms[0].isNum) {
        froms = [];
        for (let i = 0; i < tos.length; i++) {
            let vo = new Vo();
            if (tos[i].isNum) {
                vo.number = defaultValue;
                vo.isNum = true;
            }
            vo.unit = tos[i].unit;
            vo.float = tos[i].float;
            vo.string = tos[i].string;
            froms.push(vo);
        }
        tw.from = froms;
    }
    if (froms.length !== tos.length) {
        let shorter = froms.length > tos.length ? tos : froms;
        let longer = shorter === froms ? tos : froms;
        let diff = longer.length - shorter.length;
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
        part = part.replace(/[)(]+/g, "");
        let vo = getVo("dom", prop, part);
        let tw = new Tween(twType, prop, null, null, 0, 0, 0);
        tw.from = vo;
        tw.keepOld = true;
        tw.oldValue = `${prop}(${part})`;
        res.set(tw.prop, tw);
    }
    return res;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
