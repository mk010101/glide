import {toRgbStr} from "./color.js";

describe("toRgbStr() should convert all values to RGBA string.", ()=> {

    test('#ff0000 is rgba(255, 0, 0, 1)', ()=> {
        expect(toRgbStr('#ff0000')).toEqual('rgba(255, 0, 0, 1)');
    });

    test('hsl() is rgba(255, 0, 0, 1)', ()=> {
        expect(toRgbStr('hsl(50, 100%, 50%)')).toEqual('rgba(255, 213, 0, 1)');
    });


});