const data = {

    sections: [

        {
            title: "Basics",
            content: [
                {
                    title: "Begin",
                    doc: `<p><code>glide.to()</code> accepts 4 arguments: target(s), duration in milliseconds, 
                    animation properties object, and options object (optional).</p>
                    <p>Use the code editor below to change values. Click on the stage to run animation.</p>`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {left:200});`,
                },
                {
                    title: "Targets",
                    doc: `Target(s) can be an element, object, array of elements, nodeList, or a string (".myElement" or "#my-id")`,
                    numItems: 5,
                    css: ``,
                    code: `glide.to(".el", 1000, {left:200});`,
                },
                {
                    title: "Properties",
                    doc: `You can animate multiple properties at the same time. <code>x</code> and <code>y</code> 
                    are a shorthand for translateX and translateY, and <code>bg</code> for backgroundColor.`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:100, y:50, rotate:'.5turn', bg:'#ffcc00'});`,
                },
            ]
        },


        {
            title: "Values & Units",
            content: [
                {
                    title: "Values",
                    doc: `Value can be a number, an array of 2 values (begin, end), a string, or an object.`,
                    numItems: 5,
                    text: "{{i}}",
                    css: `left:50px;`,
                    code: `const els = document.querySelectorAll(".el");
glide.to(els[0], 1000, {x:200});
glide.to(els[1], 1000, {x:'8rem'});
glide.to(els[2], 1000, {x:'200%'});
glide.to(els[3], 1000, {x:['10rem', 0]}); // from - to.
`,
                },
                {
                    title: "Relative Values",
                    doc: `You can set a value to be relative to the existing one by using the following syntax:
                    <ul>
                        <li><code>+=</code> add</li>
                        <li><code>-=</code> subtract</li>
                        <li><code>*=</code> multiply</li>
                        <li><code>/=</code> divide</li>
                    </ul>`,
                    numItems: 4,
                    text: "{{i}}",
                    css: `left:100px;`,
                    code: `const els = document.querySelectorAll(".el");
glide.to(els[0], 1000, {left:'+=100'});
glide.to(els[1], 1000, {left:'-=4rem'});
glide.to(els[2], 1000, {left:'*=2'});
glide.to(els[3], 1000, {left:'/=10'});
`,
                },
                {
                    title: "Object Values",
                    doc: `<p>The value can be in the form of <code><br>{value:'50px',<br>duration:500,<br>ease:"linear"}</code></p>
                    <p>This is useful if you want to apply different timings or easing to the same animation.</p>
                    `,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:{value:180, duration:1200, ease:'cubicIn'}});`,
                },
                {
                    title: "Complex Values",
                    doc: `<p>Glide supports complex values.</p>`,
                    numItems: 2,
                    css: `width:100px; height:100px; float:left; margin-right:25px;`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 500, {border: '8px solid #61b5a4'});
glide.to(els[1], 500, {borderWidth: '6px 1rem 25', borderColor:'#61b5a4'});`,
                },
                {
                    title: "Units",
                    doc: `Glide will attempt to convert between units based on existing element's value and user's input:
                    <ul>
                        <li>If you don't specify a unit, element's unit will be used.</li>
                        <li>If you specify a unit, element's unit will be converted to the one you specified.</li>
                    </ul>`,
                    numItems: 4,
                    text: "{{i}}",
                    css: ``,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {width:200});
glide.to(els[1], 1000, {width:'8rem'});
glide.to(els[2], 1000, {width:'70%'});
glide.to(els[3], 1000, {width: '150px'});
`,
                },
            ]
        },
        {
            title: "CSS",
            content: [
                {
                    title: "General",
                    doc: `You can tween any CSS property.`,
                    numItems: 4,
                    text: "{{i}}",
                    css: ``,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {width:200});
glide.to(els[1], 1000, {marginLeft:'8rem', width:50});
glide.to(els[2], 1000, {color:'#ff0000'});
glide.to(els[3], 1000, {height:50, width:50, fontSize:24});
`,
                },
                {
                    title: "Colors",
                    doc: `Glide works with and converts between hex, rgb(a), hsl(a).`,
                    numItems: 4,
                    text: "{{i}}",
                    css: `width:50px; height:50px; float:left;`,
                    code: `const els = document.querySelectorAll(".el");
glide.to(els[0], 1000, {bg:'#ffcc00'});
glide.to(els[1], 1000, {bg:'rgba(0, 100, 255, .7)'});
glide.to(els[2], 1000, {bg:'hsl(120, 100, 50)'});
glide.to(els[3], 1000, {bg: 'hsla(180, 100, 50, .5)'});
`,
                },
                {
                    title: "Backgrounds",
                    doc: `<code>background</code> has complex structure, so always provide to-from values.`,
                    numItems: 1,
                    text: "",
                    css: `width:150px; height:150px;`,
                    code: `glide.to('.el', 2000, {background: ['linear-gradient(#0000ff, #ffcc00)', 
                    'linear-gradient(#ffcc00, #00ffcc)']});`,
                },
                {
                    title: "Transforms",
                    doc: `The following rules apply:
                    <ul>
                        <li>Glide will try to preserve transforms' order</li>
                        <li>Dual values will be converted to components: 
                        <code>translate(10px, 20px)</code> &#8594; <code>translateX(10px), translateY(20px)</code></li>
                    </ul>`,
                    numItems: 4,
                    text: "{{i}}",
                    cssProp: "transform",
                    css: `margin-bottom:25px; transform: translate(50px) rotate(-.5rad)`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {x:200});
glide.to(els[1], 1000, {rotate:'180deg'});
glide.to(els[2], 1000, {scale: '1.5, 2', rotate:'+=45deg'});
glide.to(els[3], 1000, {x:200, skewX:-25, rotate:0});
`,
                },
            ]
        },
    ]


};



export default data;