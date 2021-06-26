import {PropType, TargetType, TweenType, ValueType, ValueUnit} from "../types";
import {
    getObjType,
    is,
    regColors,
    regColorVal, regIncrements,
    regNums, regNumsUnits,
    regProp,
    regStrValues,
    regTypes,
    regValues,
    regVUs
} from "./regex";
import {Vo} from "../core/vo";
import {toRgb, toRgbStr} from "./color";
import Context from "../core/context";
import {Tween} from "../core/tween";
import target from "../core/target";


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


/**
 * Returns {Tween} type.
 * @param targetType
 * @param prop
 * @return {TweenType}
 */
export function getTweenType(targetType: any, prop: any): TweenType {

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


export function getPropType(prop: string): PropType {

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


export function getDefaultValue(prop: string): number {
    if (is.valueOne(prop))
        return 1;
    return 0;
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
 * Returns numbers from a string.
 * @param val
 */
function getNumbers(val: string): number[] {

    let nums = val.match(/[-.\d]+/g);
    return nums.map((v: string) => parseFloat(v));
}


export function unwrapValues(prop: string, val: any): any {
    const propX = prop + "X";
    const propY = prop + "Y";
    if (is.number(val)) {
        return [
            {prop: propX, val: val},
            {prop: propY, val: val}
        ];
    } else if (is.string(val)) {
        let res = val.match(regValues);
        if (res.length === 1) {
            // let vu = getValuesUnits(res[0]);
            // console.log(vu)
            res.push(is.valueOne(prop) ? "1" : "0");
        }
        return [
            {prop: propX, val: res[0]},
            {prop: propY, val: res[1]}
        ];
    } else if (is.array(val)) {
        if (val.lengh === 1) val.push(val[0]);
        return [
            {prop: propX, val: val[0]},
            {prop: propY, val: val[1]}
        ];
    }
}

function getBeginStr(prop: string) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return prop + "(";
    return "";
}

function getEndStr(prop: string) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return ")";
    return "";
}

function getSepStr(prop: string) {
    if (is.propTransform(prop) || is.propFilter(prop))
        return ", ";
    return " ";
}

/**
 * Creates {Vo} object
 * @param targetType
 * @param prop
 * @param val
 */
export function getVo(targetType: TargetType, prop: any, val: any):Vo[] {

    let res:Vo[] = [];
    let propType = getPropType(prop);


    if (is.number(val)) {


    }

    let arrColors = val.match(regColors);
    let arrCombined = [];
    if (arrColors) {
        let strParts = val.split(regColors);
        arrCombined = recombineNumsAndStrings(arrColors, strParts)
    } else {
        arrCombined = [val]
    }

    for (let i = 0; i < arrCombined.length; i++) {
        let p = arrCombined[i];
        if (p === "") continue;
        res.push(...getVUs(p));
    }

    /// Trim result
    for (let i = 0; i < res.length; i++) {
        if (res[i].number == (void 0) && res[i].string === "") {
            res.splice(i, 1);
        }
    }

    // console.log(res);

    return res;

}

function getVUs(str:string) {
    let res = [];

    if (!regVUs.test(str) && !regColors.test(str)) {
        let vo = new Vo();
        vo.string = str;
        res.push(vo);
    } else if (regColors.test(str)) {
        //TODO: Convert hex|hsl -> RGB(a).
        str = toRgbStr(str);
        let cols = getVUsArr(str);
        let count = 0;
        for (let i = 0; i < cols.length; i++) {
            if (count < 3 && cols[i].number != (void 0)) {
                cols[i].float = 0;
                count++;
            }
            res.push(cols[i]);
        }

    } else {
        let others = getVUsArr(str);
        res.push(...others);
    }
    return res;
}

function getVUsArr(str:string):Vo[] {

    let resNums:Vo[] = [];
    let resStr:Vo[] = [];
    let res:Vo[] = [];

    let nums = str.match(regVUs);
    // console.log(nums)
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
            // if (strings[i] !== "") {
            let voStr = new Vo();
            voStr.string = strings[i];
            resStr.push(voStr);
            // }
        }
    }

    while (resNums.length > 0 || resStr.length > 0) {
        if (resStr.length > 0) res.push(resStr.shift());
        if (resNums.length > 0) res.push(resNums.shift());
    }
    return res;

}

function recombineNumsAndStrings(numArr:any, strArr:any) {
    let res = [];
    while (numArr.length > 0 || strArr.length > 0) {
        if (strArr.length > 0) res.push(strArr.shift());
        if (numArr.length > 0) res.push(numArr.shift());
    }
    return res;
}


/**
 * Normalizes Tween.
 * @param tw {Tween}
 * @param context {Context}
 */
export function normalizeTween(tw: Tween, context: Context) {


    const prop = tw.prop;

    //TODO: Need to look into implementing complex values.
    if (prop === "background") return;

    const from = tw.from;
    const to = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop);
    const defaultValue = getDefaultValue(prop);

    /*
    if (from.length === 0) {

        from.floats = to.floats.concat();
        from.units = to.units.concat();

        for (let i = 0; i < to.numbers.length; i++) {
            from.numbers.push(defaultValue);
        }
    }

    if (from.numbers.length !== to.numbers.length) {
        let shorter: Vo = from.numbers.length > to.numbers.length ? to : from;
        let longer: Vo = shorter === from ? to : from;
        let diff = longer.numbers.length - shorter.numbers.length;
        shorter.strings = longer.strings;


        for (let i = 0; i < diff; i++) {

            if (shorter === from) {
                shorter.units.push(shorter.units[0]);
            } else {
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

            //shorter.numbers.push(one_zero);
            //shorter.units.push(null);
        }


    }

    if (from.strings.length > to.strings.length) to.strings = from.strings;

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
        } else if (incr === "+") {
            to.numbers[i] += from.numbers[i];
        } else if (incr === "*") {
            to.numbers[i] *= from.numbers[i];
        } else if (incr === "/") {
            to.numbers[i] /= from.numbers[i];
        }


    }
     */


    // console.log(from, to)


}


export function strToMap(str: string, twType: TweenType): Map<string, Tween> {

    let res: Map<string, Tween> = new Map();

    if (!str || str === "" || str === "none") return null;

    let arr = str.match(regStrValues);
    if (!arr) return null;

    for (let i = 0; i < arr.length; i++) {


        let part = arr[i];

        let prop = part.match(regProp)[0];
        part = part.replace(prop, "");
        let vo = getVo("dom", prop, part);

        let tw = new Tween(twType, prop, null, null, 0, 0, 0);
        //tw.from = vo;
        tw.keepOld = true;
        tw.oldValue = prop + part;
        res.set(tw.prop, tw);

        // console.log(tw)


    }
    // console.log(res)
    return res;
}


export function print(val: any) {
    console.log(JSON.stringify(val, null, 4));
}





