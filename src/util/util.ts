import {PropType, TargetType, TweenType, ValueType, ValueUnit} from "../types";
import {getObjType, is, regColorVal, regNums, regProp, regStrValues, regTypes, regValues, regVUs} from "./regex";
import {Vo} from "../core/vo";
import {toRgb, toRgbStr} from "./color";
import Context from "../core/context";
import {Tween} from "../core/tween";


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


export function getPropType(prop: string): PropType {

    if (is.propDropShadow(prop))
        return "dropShadow";
    else if (is.propColor(prop))
        return "color";
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


/**
 * Creates {Vo} object
 * @param targetType
 * @param prop
 * @param val
 */
export function getVo(targetType: TargetType, prop: any, val: any) {

    let vo = new Vo();
    let propType = getPropType(prop);

    // console.log(prop, val)

    if (is.number(val)) {
        vo.numbers = [val];
        return vo;
    }

    switch (propType) {

        case "color":
            let colorMatch = val.match(regColorVal);
            let color: string;
            if (colorMatch) {
                color = toRgbStr(colorMatch[0]);
                val = val.replace(colorMatch[0], color);
            }
            vo.numbers = getNumbers(val);
            vo.strings = val.split(regNums);
            vo.valueTypes.push(0, 0, 0);
            if (vo.numbers.length === 4) vo.valueTypes.push(1);
            break;

    }

    // console.log(vo)


    if (targetType === "dom" && is.valueOne(prop)) {
        if (val == void 0)
            val = 1;
    }

    /*

        switch (propType) {

            // case "css":
            // case "transform":
            //     let vus: ValueUnit[] = getValuesUnits(val);
            //     //console.log(vus)
            //     for (let i = 0; i < vus.length; i++) {
            //         vo.values.push(vus[i].value);
            //         vo.units.push(vus[i].unit);
            //         vo.increments.push(vus[i].increment);
            //     }
            //     break;

            case "color":
                let colorMatch = val.match(regColorVal);
                let color: string;
                if (colorMatch) {
                    color = toRgbStr(colorMatch[0]);
                    val = val.replace(colorMatch[0], color);
                }
                vo.numbers = getNumbers(val);
                for (let i = 0; i < vo.numbers.length; i++) {
                    vo.units.push("");
                }
                // vo.strBegin = vo.values.length === 4 ? "rgba" : "rgb";
                break;

            case "dropShadow":

                if (!val) val = "0px 0px 0px #cccccc";
                let rgb = val.match(regColorVal)[0];
                val = val.replace(rgb, "");
                let pa: ValueUnit[] = getValuesUnits(val);
                for (let i = 0; i < pa.length; i++) {
                    vo.numbers.push(pa[i].value);
                    vo.units.push(pa[i].unit);
                    vo.increments.push(pa[i].increment);
                }
                let rgbs = toRgb(rgb);
                /// First 3 items are offset-x, offset-y and blur-radius. The other 3 or 4 - rgb(a) values.
                vo.numbers = vo.numbers.concat(...rgbs);
                // console.log(vo.values)
                break;

            case "matrix":
                if (!val) {
                    vo.numbers = [1, 0, 0, 1, 0, 0];
                    vo.units = ["", "", "", "", "", ""];
                } else {
                    vo.numbers = getNumbers(val);
                    vo.units = ["", "", "", "", "", ""];
                }
                break;

            case "other":

                let vus: ValueUnit[] = getValuesUnits(val);

                //console.log(vus)
                for (let i = 0; i < vus.length; i++) {
                    vo.numbers.push(vus[i].value);
                    let unit = targetType === "dom" ? vus[i].unit : null;
                    vo.units.push(unit);
                    vo.increments.push(vus[i].increment);
                }


        }
    */

    return vo;

}

function getVoFromStr(str: string): Vo {
    let prop = str.match(regProp)[0];
    str = str.replace(prop, "");
    return getVo("dom", prop, str);
}

/**
 * Normalizes Tween.
 * @param tw {Tween}
 * @param context {Context}
 */
export function normalizeTween(tw: Tween, context: Context) {

    const prop = tw.prop;
    const from = tw.from;
    const to = tw.to;

    if (from.numbers.length !== to.numbers.length) {
        let shorter: Vo = from.numbers.length > to.numbers.length ? to : from;
        let longer: Vo = shorter === from ? to : from;

        if (is.propColor(prop)) {
            shorter.numbers.push(1);
            shorter.strings = longer.strings;
        }

    }

    for (let i = 0; i < from.units.length; i++) {



    }



    // console.log(tw)

    /*
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

    // console.log(from.units, to.units);
    // console.log(from.values, to.values);

    for (let i = 0; i < from.units.length; i++) {
        let uFrom = from.units[i];
        let uTo = to.units[i];
        let incr = to.increments[i];
        if (!tw.isNum) {
            if (!uFrom) uFrom = from.units[i] = getDefaultUnit(tw.prop);
            if (!uTo) uTo = to.units[i] = uFrom;
            if (uFrom && uFrom !== uTo) {
                //TODO: Add logic to deal with translate(XYZ) percentages!
                if (is.propTransform(tw.prop) && (uFrom === "%" && uTo !== "%" || uFrom !== "%" && uTo === "%")) {
                    //console.log("% conversion!")
                } else {
                    from.numbers[i] = Context.convertUnits(from.numbers[i], uFrom, uTo, context.units);
                }
            }
        }

        // console.log(incr)
        if (incr === "-") {
            to.numbers[i] = from.numbers[i] - to.numbers[i];
        } else if (incr === "+") {
            to.numbers[i] += from.numbers[i];
        } else if (incr === "*") {
            to.numbers[i] *= from.numbers[i];
        } else if (incr === "/") {
            to.numbers[i] /= from.numbers[i];
        }

        //tw.diffVals.push(to.values[i] - from.values[i]);

    }
     */
    // console.log(from.units, to.units);
    // console.log(from.values, to.values);
}


export function strToMap(str: string): Map<string, Tween> {

    let res: Map<string, Tween> = new Map();

    if (!str || str === "" || str === "none") return null;

    let arr = str.match(regStrValues);
    if (!arr) return null;

    for (let i = 0; i < arr.length; i++) {


        let part = arr[i];
        let vo = getVoFromStr(part);
        // vo.keepOriginal = true;
        // vo.keepStr = part;
        /*
        if (is.propDual(vo.prop)) {
            let prop = part.match(regProp)[0];
            let propX = prop + "X";
            let propY = prop + "Y";
            let part2 = part.replace(prop, "");
            let vus = part2.match(regValues);
            if (vus.length === 1) vus.push(is.valueOne(prop)? "1" : "0");

            let vox = getVo("dom", propX, vus[0]);
            vox.keepOriginal = true;
            vox.keepStr = `${propX}(${vus[0]})`;

            let voy = getVo("dom", propY, vus[1]);
            voy.keepOriginal = true;
            voy.keepStr = `${propY}(${vus[1]})`;

            let twx = new Tween(null, "transform", propX, null, null, 0, 0, 0);
            twx.from = vox;
            res.set(propX, twx);

            let twy = new Tween(null, "transform", propY, null, null, 0, 0, 0);
            twy.from = voy;
            res.set(propY, twy);

            //console.log(vo.prop, vo.values)
            // let res = unwrapValues(vo.prop, vo.values);
        } else {
            let tw = new Tween(null, "transform", vo.prop, null, null, 0, 0, 0);
            tw.from = vo;
            res.set(vo.prop, tw);
        }
        //*/

        let tw = new Tween("transform", "prop", null, null, 0, 0, 0);
        tw.from = vo;
        res.set(tw.prop, tw);

    }
    // console.log(res)
    return res;
}


export function print(val: any) {
    console.log(JSON.stringify(val, null, 4));
}





