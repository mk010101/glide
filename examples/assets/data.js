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
                    innerHTML: "Stage",
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
                    code: `glide.to(".el", 1500, {x:200, y:{value:100, duration:1000, ease:'bounceOut'}});`,
                },
                {
                    title: "Complex Values",
                    doc: `<p>Glide supports complex values.</p>`,
                    numItems: 2,
                    css: `width:100px; height:100px; float:left; margin-right:25px;`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 500, {border: '8px solid #ff5500'});
glide.to(els[1], 500, {borderWidth: '6px 1rem 25', borderColor:'#ff5500'});`,
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
                    css: `width:2rem;`,
                    cssProp: "width",
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {width:12});
glide.to(els[1], 1000, {width:'8rem'});
glide.to(els[2], 1000, {width:'70%'});
glide.to(els[3], 1000, {width: '150px'});
`,
                },
            ]
        },

        {
            title: "Chaining & Events",
            content: [
                {
                    title: "Chain of Tweens",
                    doc: `<p>It's easy to build complex animations by simply chaining the <code>.to(...)</code> method.`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 500, {x:200, rotate:180})
\t.to(500, {y:-100, bg:'#ff3399'})
\t.to(500, {x:0, width:100})
\t.to(500, {width:25, rotate:0, y:0, bg:'#a8d153'});`,
                },
                {
                    title: "Set",
                    doc: `<p>You can use <code>.set(...)</code> command to instantly apply property to a target.`,
                    numItems: 2,
                    css: ``,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {x:200, rotate:180})
\t.set({bg:'#ff3399'}); // Set immediately.

glide.to(els[1], 1000, {x:200, rotate:180})
\t.set({bg:'#ff3399'}, {delay:500}); // Set after a delay.
`,
                },
                {
                    title: "Events",
                    doc: `Following events are emitted:
                    <ul>
                        <li><code>start</code>: animation start.</li>
                        <li><code>end</code>: animation ended (including all repeats and delays).</li>
                        <li><code>keyframeend</code>: keyframe ended.</li>
                        <li><code>loopend</code>: end of repeat cycle.</li>
                        <li><code>progress</code>: animation progress.</li>
                    </ul>`,
                    numItems: 20,
                    css: `float:left; width:5px; `,
                    innerHTML: `
<div class="stage-data">
    <div class="a-start">Start</div>
    <div class="a-progress">Progress:</div>
    <div class="a-call">Function call</div>
    <div class="a-keyframe">Keyframe end</div>
    <div class="a-loopend">Loop end</div>
    <div class="a-end">End</div>
</div>
`,
                    code: `const progress = stage.querySelector('.a-progress');
const kf = stage.querySelector('.a-keyframe');
                    
const animation = glide.to(".el", 500, {y:50, scaleY:2, rotate:180, bg:'rgba(50,250,100,0.7)'}, {repeat:1, stagger:30})
\t.on("start", ()=> stage.querySelector('.a-start').classList.add('selected'))
\t.on("progress", ()=> {
\t\tprogress.classList.add('selected'); 
\t\tprogress.innerHTML = 'Progress: ' + animation.getProgress() + '%';})
\t.call(()=> stage.querySelector('.a-call').classList.add('selected'))
\t.to(500, {y:100, scaleY:1, bg:'#ff3399'}, {stagger:30})
\t.on("keyframeend", ()=> {kf.classList.add('selected'); kf.innerHTML = 'Keyframe end: ' + animation.getCurrentKeyframe().id;})
\t.on("loopend", ()=> stage.querySelector('.a-loopend').classList.add('selected'))
\t.on("end", ()=> stage.querySelector('.a-end').classList.add('selected'));`,
                },
            ]
        },


        {
            title: "Properties",
            content: [
                {
                    title: "CSS",
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
                    doc: `<code>background</code> has a complex structure, so always provide to-from values.`,
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
                {
                    title: "SVG",
                    doc: `Glide can animate all SVG elements' properties.`,
                    numItems: 0,
                    innerHTML: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 600 600" style="enable-background:new 0 0 600 600;" xml:space="preserve">
    <text x="10" y="50">SVG</text>
    <rect id="rect-1" x="10" y="80" width="100" height="50" fill="rgba(255, 138, 55, 0.7)"/>
    <rect id="rect-2" x="10" y="180" width="100" height="50" fill="rgba(255, 255, 0, 0.7)"/>
    <ellipse id="ellipse" cx="60" cy="320" rx="100" ry="40" fill="rgba(0, 138, 55, 0.7)"/>
</svg>`,
                    css: ``,
                    code: `glide.to("#rect-1", 1500, {translate:"250", rotate:180});
glide.to("#rect-2", 1500, {rx:20, translate:180, width:250});
glide.to("#ellipse", 1500, {rx:60, ry:70, translate:"250, 20", fill:'rgba(255, 0, 0, 0.7)'});
`,
                },
                {
                    title: "Path",
                    doc: `For elements, you can specify offset value in the options: <code>{offset:'-50%'}</code>. 
                    This useful to keep elements centred on the path.`,
                    numItems: 1,
                    innerHTML: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
x="0px" y="0px"
     viewBox="0 0 600 600" style="enable-background:new 0 0 600 600;" xml:space="preserve">
     <text x="10" y="50">SVG</text>
     <path id="path-1" d="M59.1,458.8C59.1,352.3,164.3,266,294.1,266 
C397.9,266,482,335,482,420.2c0,68.1-67.3,123.4-150.4,123.4c-66.4,0-120.3-44.2-120.3-98.7c0-43.6,43.1-79,96.2-79 
c42.5,0,77,28.3,77,63.2" fill="none" stroke="#3399FF" stroke-width="4"/>
    <rect id="rect-1" x="20" y="100" width="40" height="40" fill="rgba(51, 153, 255, 0.73)"/>
</svg>`,
                    css: `background-color: rgba(255, 36, 252, 0.73); position:absolute;`,
                    code: `const path = document.querySelector('#path-1');
                    
glide.to("#rect-1", 3000, {path: path}, {offset:'-50%'}); //SVG element
glide.to(".el", 3000, {path: path}, {offset:'-50%', delay:500}); //HTML element
`,
                },
                {
                    title: "Filters",
                    doc: `All filters are supported. Glide will try to preserve the order of filters: 
                    applying <code>drop-shadow()</code> and then <code>hue-rotate()</code> will produce a different 
                    result if you swap their order.`,
                    numItems: 9,
                    text: "{{i}}",
                    cssProp: "",
                    css: `float:left; margin:25px;`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.to(els[0], 1000, {dropShadow:'6px 6px 3px #00cccc'});
glide.to(els[1], 1000, {hueRotate:70});
glide.to(els[2], 1000, {blur:'3px'});
glide.to(els[3], 1000, {sepia:90});
glide.to(els[4], 1000, {grayscale:90});
glide.to(els[5], 1000, {contrast:200});
glide.to(els[6], 1000, {saturate:500});
glide.to(els[7], 1000, {saturate:500, hueRotate:-70, dropShadow:'6px 6px 3px #00cccc'});
glide.to(els[8], 1000, {dropShadow:'6px 6px 3px #00cccc', saturate:500, hueRotate:-70});
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
                            <br>&nbsp;ease: 'quadInOut',
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
                            <br>&nbsp;ease: 'quadInOut',
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
                            <br>&nbsp;ease: 'quadInOut',
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
                            <br>&nbsp;ease: 'quadInOut',
                            <br>&nbsp;keep: false,
                            <br>&nbsp;paused: false,
                        </code></p>`,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:180}, {repeat:3, loop:false});`,
                },
                {
                    title: "Easing",
                    doc: `<p>Glide supports all Penner's easing functions. Additionally, there's stepped and custom easing.</p>`,
                    numItems: 8,
                    text: "{{i}}",
                    css: ``,
                    code: `const els = document.querySelectorAll(".el");

function myEase(t) {
  return 1 - (Math.cos(Math.PI*t) + 1) / 2;
}
                    
glide.to(els[0], 3000, {width:200}); //No easing specified, default is quadInOut.
glide.to(els[1], 3000, {width:200}, {ease:'circleInOut'});
glide.to(els[2], 3000, {width:200}, {ease:'expoInOut'});
glide.to(els[3], 3000, {width:200}, {ease:'bounceOut'});
glide.to(els[4], 3000, {width:200}, {ease:'elasticOut'});
glide.to(els[5], 3000, {width:200}, {ease:'backOut'});
glide.to(els[6], 3000, {width:200}, {ease:'stepped(12)'});
glide.to(els[7], 3000, {width:200}, {ease: myEase});
`,
                },
            ]
        },


        {
            title: "fx",
            content: [

                {
                    title: "Shake",
                    doc: `<p>Options:
                        <ul>
                            <li><code>axis: 'x'</code> 'x' or 'y'. Default: 'x'</li>
                            <li><code>speed: 20</code> Speed of shaking. Default: 20.</li>
                            <li><code>distance: 20</code> Distance of movement. Default: 10.</li>
                            <li><code>times: 5</code> Times to shake. Default: 4.</li>
                        </ul>

</p>`,
                    numItems: 2,
                    text: "{{i}}",
                    css: `width:125px; height:75px; float:left; margin-right:25px;`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.fx.shake(els[0]);
glide.fx.shake(els[1], {axis:'y', speed:10, distance:20, times:6});
`,
                },
                {
                    title: "Flap",
                    doc: `<p>Options:
                        <ul>
                            <li><code>axis: 'x'</code> 'x', 'y' or 'z'. Default: 'y'</li>
                            <li><code>speed: 20</code> Speed of shaking. Default: 15.</li>
                            <li><code>angle: 30</code> Angle of movement. Default: 20deg.</li>
                            <li><code>times: 5</code> Times to shake. Default: 4.</li>
                        </ul>

</p>`,
                    numItems: 3,
                    text: "{{i}}",
                    css: `width:100px; height:75px; float:left; margin-right:25px; margin-bottom:25px;`,
                    code: `const els = document.querySelectorAll(".el");
                    
glide.fx.flap(els[0]);
glide.fx.flap(els[1], {axis:'x', speed:10, distance:20, times:6});
glide.fx.flap(els[2], {axis:'z'});
`,
                },
                {
                    title: "Flip",
                    doc: `<p>Flips elements around X or Y-axis.</p>
                        <p>Options:
                        <ul>
                            <li><code>axis: 'x'</code> 'x' or 'y'. Default: 'y'.</li>
                            <li><code>speed: 3</code> Speed of rotation. Default: 2.5.</li>
                            <li><code>continuous: false</code> If set to true, element will keep flipping in the same direction. Default: false.</li>
                        </ul>

</p>`,
                    numItems: 0,
                    text: "",
                    disableStage: true,
                    css: ``,
                    innerHTML: `
                    <style>
                        .el {
                            margin-right: 25px;
                            float:left;
                        }
                        .el, .face {
                            width: 125px;
                            height: 100px;
                            cursor: pointer;
                        }
                        .face {
                            padding: 10px;
                        }
                        .f2 {
                            display: none;
                        }
                    </style>
                    <div class="el n1"><div class="face f1">Side 1<p>Click me</p></div><div class="face f2">Side 2<p>Click me too!</p></div></div>
                    <div class="el n2"><div class="face f1">Side 1<p>Click me</p></div><div class="face f2">Side 2<p>Click me too!</p></div></div>
`,
                    code: `const flip1 = new glide.fx.Flip('.n1', '.n1 > .f1', '.n1 > .f2', {continuous:true});
flip1.flip();
flip1.target.addEventListener("click", ()=> flip1.flip());
   
const flip2 = new glide.fx.Flip('.n2', '.n2 > .f1', '.n2 > .f2', {axis:'x', speed:1.5});
flip2.flip();
flip2.target.addEventListener("click", ()=> flip2.flip());                 

`,
                },
            ]
        }
    ]


};


export default data;