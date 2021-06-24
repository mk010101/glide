import {PropType, TargetType, TweenType, ValueType, ValueUnit} from "../types";
import {getObjType, is, regColorVal, regNums, regProp, regStrValues, regTypes, regValues, regVUs} from "./regex";
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
export function getVo(targetType: TargetType, prop: any, val: any) {

    let vo = new Vo();
    let propType = getPropType(prop);

    // console.log(prop, val)

    if (is.number(val)) {
        vo.numbers = [val];
        vo.units = [null];
        vo.increments = [null];
        return vo;
    }

    if(is.string(val) && is.valueColor(val)) {
        let colorMatch = val.match(regColorVal);
        if (colorMatch) {
            let color: string;
            color = toRgbStr(colorMatch[0]);
            val = val.replace(colorMatch, "");
            val = color + " " + val;
        }
        console.log(val.match(/[-+=.\w%]+/g))
    }

    switch (propType) {


        case "color":
            vo.numbers = getNumbers(val);
            vo.strings = val.split(regNums);
            vo.floats.push(0, 0, 0);
            if (vo.numbers.length === 4) vo.floats.push(1);
            for (let i = 0; i < vo.numbers.length; i++) {
                vo.increments.push(null);
            }
            break;

        default:
            let vus: ValueUnit[] = getValuesUnits(val);
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

    // console.log(vo)


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


/**
 * Normalizes Tween.
 * @param tw {Tween}
 * @param context {Context}
 */
export function normalizeTween(tw: Tween, context: Context) {

    const prop = tw.prop;
    const from = tw.from;
    const to = tw.to;
    const twType = tw.twType;
    const propType = getPropType(prop);
    const defaultUnit = getDefaultUnit(prop);

    if (from.numbers.length !== to.numbers.length) {
        let shorter: Vo = from.numbers.length > to.numbers.length ? to : from;
        let longer: Vo = shorter === from ? to : from;
        let diff = longer.numbers.length - shorter.numbers.length;
        shorter.strings = longer.strings;

        /// Other ---------------------

        //let one_zero = is.valueOne(prop) ? 1 : 0;
        for (let i = 0; i < diff; i++) {

            if (shorter === from) {
                shorter.units.push(shorter.units[0]);
            } else {
                to.units.push(to.units[to.units.length-1]);
                to.increments.push(to.increments[to.increments.length-1]);
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


    // console.log(from, to)

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

}


export function strToMap(str: string, twType:TweenType): Map<string, Tween> {

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
        tw.from = vo;
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





