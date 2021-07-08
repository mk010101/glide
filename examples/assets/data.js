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
                    cssProp: "left",
                    code: `const els = document.querySelectorAll(".el");
glide.to(els[0], 1000, {left:'+=100'});
glide.to(els[1], 1000, {left:'-=4rem'});
glide.to(els[2], 1000, {left:'*=2'});
glide.to(els[3], 1000, {left:'/=4'});
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
glide.to(els[3], 1000, {height:50, width:50, fontSize:36});
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


        {
            title: "SVG",
            content: [
                {
                    title: "SVG",
                    doc: `Glide can animate all SVG elements' properties.`,
                    numItems: 0,
                    innerHTML: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 600 600" style="enable-background:new 0 0 600 600;" xml:space="preserve">
    <text x="10" y="50">SVG</text>
    <rect id="rect-1" x="10" y="80" width="100" height="50" fill="rgba(255, 138, 55, 0.7)"/>
    <rect id="rect-2" x="10" y="160" width="100" height="50" fill="rgba(255, 255, 0, 0.7)"/>
    <ellipse id="ellipse" cx="60" cy="280" rx="100" ry="40" fill="rgba(0, 138, 55, 0.7)"/>
</svg>`,
                    css: ``,
                    code: `glide.to("#rect-1", 1000, {x:200});
glide.to("#rect-2", 1000, {rx:20, translate:190});
glide.to("#ellipse", 1000, {rx:60, ry:70, translate:"190, 20", fill:'rgba(255, 0, 0, 0.7)'});
`,
                },
                {
                    title: "Path",
                    doc: `For elements, you can specify offset value in the options: <code>{offset:'-50%'}</code>. 
                    This useful to keep elements centred on the path.`,
                    numItems: 1,
                    innerHTML: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
     y="0px"
     viewBox="0 0 600 600" style="enable-background:new 0 0 600 600;" xml:space="preserve">
     <text x="10" y="50">SVG</text>
     <path id="path-1" d="M59.1,458.8C59.1,352.3,164.3,266,294.1,266 
C397.9,266,482,335,482,420.2c0,68.1-67.3,123.4-150.4,123.4c-66.4,0-120.3-44.2-120.3-98.7c0-43.6,43.1-79,96.2-79 
c42.5,0,77,28.3,77,63.2" fill="none" stroke="#3399FF" stroke-width="4"/>
    <rect id="rect-1" x="20" y="100" width="40" height="40" fill="rgba(51, 153, 255, 0.73)"/>
</svg>`,
                    css: `background-color: rgba(255, 36, 252, 0.73); position:absolute;`,
                    code: `const path = document.querySelector('#path-1');
                    
glide.to("#rect-1", 3000, {path: path}, {offset:'-50%'});
glide.to(".el", 3000, {path: path}, {offset:'-50%', delay:500});
`,
                },
            ]
        },


        {
            title: "Options",
            content: [
                {
                    title: "Delay",
                    doc: `<p>The following options can be set:<br>
                        <code>
                            <br>&nbsp;<span class="highlight">delay: 500,</span>
                            <br>&nbsp;stagger: 50,
                            <br>&nbsp;repeat: 3,
                            <br>&nbsp;loop: true,
                            <br>&nbsp;keep: false,
                            <br>&nbsp;paused: false,
                        </code></p>`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {left:200}, {delay:500});`,
                },
                {
                    title: "Stagger",
                    doc: `<p>The following options can be set:<br>
                        <code>
                            <br>&nbsp;delay: 500,
                            <br>&nbsp;<span class="highlight">stagger: 50</span>,
                            <br>&nbsp;repeat: 3,
                            <br>&nbsp;loop: true,
                            <br>&nbsp;keep: false,
                            <br>&nbsp;paused: false,
                        </code></p>`,
                    numItems: 10,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:180}, {stagger:50});`,
                },
                {
                    title: "Repeat",
                    doc: `<p>The following options can be set:<br>
                        <code>
                            <br>&nbsp;delay: 500,
                            <br>&nbsp;stagger: 50,
                            <br>&nbsp;<span class="highlight">repeat: 3,</span>
                            <br>&nbsp;loop: true,
                            <br>&nbsp;keep: false,
                            <br>&nbsp;paused: false,
                        </code></p>`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:180}, {repeat:3});`,
                },
                {
                    title: "Loop",
                    doc: `<p>The following options can be set:<br>
                        <code>
                            <br>&nbsp;delay: 500,
                            <br>&nbsp;stagger: 50,
                            <br>&nbsp;<span class="highlight">repeat: 3,</span>
                            <br>&nbsp;<span class="highlight">loop: false,</span>
                            <br>&nbsp;keep: false,
                            <br>&nbsp;paused: false,
                        </code></p>`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:180}, {repeat:3, loop:false});`,
                },
            ]
        },
    ]


};


export default data;