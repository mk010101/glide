import { getObjType, is, regColors, regIncrements, regNumsUnits, regProp, regStrValues, regTypes, regValues, regVUs } from "./regex";
import { SvgVo, Vo } from "../core/vo";
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
    if (targetType === "obj")
        return "obj";
    else if (is.propTransform(prop))
        return "transform";
    else if (is.propFilter(prop))
        return "filter";
    else if (is.propDirect(prop))
        return "direct";
    else if (prop === "path")
        return "path";
    else if (targetType === "svg")
        return "svg";
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
export function getDefaultUnit(prop, targetType) {
    if (targetType === "obj") {
        return null;
    }
    else if (is.unitDegrees(prop))
        return "deg";
    else if (is.unitPercent(prop))
        return "%";
    else if (is.unitless(prop) || targetType === "svg")
        return "";
    return "px";
}
export function getDefaultValue(prop) {
    if (prop === "saturate")
        return 100;
    else if (is.valueOne(prop))
        return 1;
    return 0;
}
export function getValueUnit(val) {
    if (is.number(val)) {
        return {
            value: val,
            unit: null,
            increment: null
        };
    }
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
function getVUs(val) {
    let res = [];
    if (is.number(val))
        return [getValueUnit(val)];
    const arr = val.match(regVUs);
    arr.map((v) => {
        res.push(getValueUnit(v));
    });
    return res;
}
function getNumbers(val) {
    let nums = val.match(/[-.\d]+/g);
    return nums.map((v) => parseFloat(v));
}
export function stringToPropsVals(str) {
    let arr = [];
    let parts = str.match(regStrValues);
    for (let j = 0; j < parts.length; j++) {
        let part = parts[j];
        let prop = part.match(regProp)[0];
        part = part.replace(prop, "");
        part = part.replace(/^\(|\)$/g, "");
        arr.push({
            prop: prop,
            value: part
        });
    }
    return arr;
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
function getDefaultVo(prop, val = null) {
    let vo = new Vo();
    if (val == null)
        return vo;
    if (is.propFilter(prop) || is.propTransform(prop)) {
        vo.numbers.push(null, val, null);
        vo.floats.push(1, 1, 1);
        vo.units.push(null, null, null);
        vo.strings.push(prop + "(", null, ")");
        vo.increments.push(null, null, null);
    }
    else {
        vo.numbers.push(val);
        vo.floats.push(1);
        vo.units.push(null);
        vo.strings.push(null);
        vo.increments.push(null);
    }
    return vo;
}
function addBraces(vo, prop) {
    if (is.propTransform(prop) || is.propFilter(prop)) {
        vo.strings.unshift(prop + "(");
        vo.numbers.unshift(null);
        vo.increments.unshift(null);
        vo.floats.unshift(1);
        vo.units.unshift(null);
        vo.strings.push(")");
        vo.numbers.push(null);
        vo.increments.push(null);
        vo.floats.push(1);
        vo.units.push(null);
    }
}
export function getVo(target, prop, val, options = null) {
    let vo = new Vo();
    let res = [];
    if (val == void 0) {
        vo = getDefaultVo(prop, val);
        return vo;
    }
    else if (is.number(val)) {
        return getDefaultVo(prop, val);
    }
    if (prop === "path") {
        const pVo = new SvgVo();
        let path;
        if (is.svg(val)) {
            path = val;
        }
        else {
            path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", val);
        }
        pVo.path = path;
        pVo.len = path.getTotalLength();
        pVo.svg = getSvg(path);
        pVo.bBox = is.svg(target.el) ? target.el.getBBox() : target.el.getBoundingClientRect();
        if ((options === null || options === void 0 ? void 0 : options.offset) !== undefined) {
            let vus = getVUs(options.offset);
            pVo.offsetX = vus[0].unit === "%" ? vus[0].value / 100 * pVo.bBox.width : vus[0].value;
            if (vus.length === 1)
                pVo.offsetY = pVo.offsetX;
            else
                pVo.offsetY = vus[1].unit === "%" ? vus[1].value / 100 * pVo.bBox.width : vus[1].value;
        }
        return pVo;
    }
    let arrColors = val.match(regColors);
    let arrCombined = [];
    if (arrColors) {
        if (prop === "drop-shadow") {
            val = arrColors[0] + " " + val.replace(arrColors[0], "");
        }
        for (let i = 0; i < arrColors.length; i++) {
            arrColors[i] = toRgbStr(arrColors[i]);
        }
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
        getVUstrings(p);
        res.push(...getVUstrings(p));
    }
    for (let i = res.length - 1; i >= 0; i--) {
        let p = res[i];
        let vus = p.match(regVUs);
        if (vus) {
            let vus = p.match(regNumsUnits);
            let num = 0.0;
            let digStr = vus[0];
            let unit = vus[1] || null;
            let incr = null;
            let incrMatch = digStr.match(regIncrements);
            if (incrMatch) {
                incr = incrMatch[0][0];
                digStr = digStr.replace(incrMatch[0], "");
            }
            num = parseFloat(digStr);
            vo.numbers.unshift(num);
            vo.floats.unshift(1);
            vo.units.unshift(unit);
            vo.increments.unshift(incr);
            vo.strings.unshift(null);
        }
        else if (p !== "") {
            vo.numbers.unshift(null);
            vo.units.unshift(null);
            vo.increments.unshift(null);
            vo.strings.unshift(p);
            vo.floats.push(1);
        }
    }
    addBraces(vo, prop);
    return vo;
}
function getVUstrings(str) {
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
export function normalizeTween(tw, target) {
    var _a, _b;
    const prop = tw.prop;
    let from = tw.from;
    let to = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop, target.type);
    const defaultValue = getDefaultValue(prop);
    if (twType === "path")
        return;
    if (prop === "rotate" && target.type === "svg") {
        let bbox = target.el.getBBox();
        let a1 = bbox.x + bbox.width / 2;
        let a2 = bbox.y + bbox.height / 2;
        tw.to.numbers.push(a1, null, a2, null);
        if (tw.from.numbers.length === 0) {
            tw.from.numbers = tw.to.numbers.concat();
            tw.from.numbers[1] = 0;
        }
        else if (tw.from.numbers.length === 3) {
            tw.from.numbers.push(0, null, 0, null);
        }
        tw.to.strings.splice(2, 0, ", ", null, ", ", null);
        tw.to.units.push("", "", "", "");
    }
    if (from.numbers.length !== to.numbers.length) {
        let shorter = from.numbers.length > to.numbers.length ? to : from;
        let longer = shorter === from ? to : from;
        shorter.strings = longer.strings;
        for (let i = shorter.numbers.length; i < longer.numbers.length; i++) {
            if (longer.numbers[i] != null) {
                shorter.numbers.push(defaultValue);
                shorter.units.push(defaultUnit);
            }
            else {
                shorter.numbers.push(null);
                shorter.units.push(null);
            }
            shorter.increments.push(null);
        }
    }
    for (let i = 0; i < to.numbers.length; i++) {
        if (((_a = to.strings[i]) === null || _a === void 0 ? void 0 : _a.indexOf("rgb")) > -1) {
            from.units[i + 1] = from.units[i + 3] = from.units[i + 5] =
                to.units[i + 1] = to.units[i + 3] = to.units[i + 5] = "";
            to.floats[i + 1] = to.floats[i + 3] = to.floats[i + 5] = 0;
            if (((_b = to.strings[i]) === null || _b === void 0 ? void 0 : _b.indexOf("rgba")) > -1) {
                to.units[i + 7] = from.units[i + 7] = "";
            }
        }
        if (to.numbers[i] != null) {
            if (from.numbers[i] == null)
                from.numbers[i] = defaultValue;
            if (target.type !== "svg") {
                if (from.units[i] == null)
                    from.units[i] = defaultUnit;
                if (to.units[i] == null) {
                    to.units[i] = from.units[i];
                }
                if (from.units[i] !== to.units[i]) {
                    from.numbers[i] = Context.convertUnits(from.numbers[i], from.units[i], to.units[i], target.context.units);
                }
            }
            else {
                to.units[i] = "";
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
                to.numbers[i] = from.numbers[i] / to.numbers[i];
            }
        }
    }
}
export function strToMap(str, twType, targetType) {
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
        part = part.replace(/^\(|\)$/g, "");
        if (is.propDual(prop) && targetType !== "svg") {
            let unwrapped = unwrapValues(prop, part);
            for (let j = 0; j < unwrapped.length; j++) {
                const p = unwrapped[j];
                let vo = getVo(null, p.prop, p.val);
                let tw = new Tween(twType, p.prop, null, null, 0, 0, 0);
                tw.keepOld = true;
                tw.oldValue = `${p.prop}(${p.val})`;
                tw.from = vo;
                res.set(p.prop, tw);
            }
        }
        else {
            let tw = new Tween(twType, prop, null, null, 0, 0, 0);
            tw.from = getVo(null, prop, part);
            tw.keepOld = true;
            tw.oldValue = `${prop}(${part})`;
            res.set(tw.prop, tw);
        }
    }
    return res;
}
export function getSvg(node) {
    let parent = node;
    while (parent instanceof SVGElement) {
        if (!(parent.parentNode instanceof SVGElement)) {
            return parent;
        }
        parent = parent.parentNode;
    }
    return parent;
}
export function print(val) {
    console.log(JSON.stringify(val, null, 4));
}
