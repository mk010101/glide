import { getObjType, is, regColors, regIncrements, regNumsUnits, regProp, regStrValues, regTypes, regValues, regVUs } from "./regex";
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
    let res = [];
    let propType = getPropType(prop);
    if (is.number(val)) {
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
        if (res[i].number == (void 0) && res[i].string === "")
            res.splice(i, 1);
    }
    console.log(res);
    return res;
}
function getVUs(str) {
    let res = [];
    if (!regVUs.test(str) && !regColors.test(str)) {
        let vo = new Vo();
        vo.string = str;
        res.push(vo);
    }
    else if (regColors.test(str)) {
        let cols = getVUsArr(str);
        let count = 0;
        for (let i = 0; i < cols.length; i++) {
            if (count < 3 && cols[i].number != (void 0)) {
                cols[i].float = 0;
                count++;
            }
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
            let num = nums[i];
            let incr = null;
            let incrMatch = num.match(regIncrements);
            if (incrMatch) {
                incr = incrMatch[0];
                num = num.replace(incr, "");
                incr = incr.substr(0, 1);
            }
            let nus = num.match(regNumsUnits);
            let voNum = new Vo();
            voNum.number = parseFloat(nus[0]);
            voNum.unit = nus[1];
            voNum.string = "";
            voNum.increment = incr;
            voNum.float = 1;
            voNum.isNum = true;
            resNums.push(voNum);
        }
        for (let i = 0; i < strings.length; i++) {
            let voStr = new Vo();
            voStr.string = strings[i];
            resStr.push(voStr);
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
    const from = tw.from;
    const to = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop);
    const defaultValue = getDefaultValue(prop);
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
        tw.keepOld = true;
        tw.oldValue = prop + part;
        res.set(tw.prop, tw);
    }
    return res;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
