const data = {

    sections: [
        {
            title: "Basics",
            content: [
                {
                    title: "Begin",
                    doc: `<p><code>glide.to()</code> accepts 4 arguments: target(s), duration in milliseconds, 
                    animation properties object, and options object (optional).</p>
                    <p>Use code editor below to change values. Click on the stage to run animation.</p>

`,
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
                    code: `glide.to(".el", 1000, {x:100, y:50, bg:'#ffcc00'});`,
                },
            ]
        },
        {
            title: "Values/Units",
            content: [
                {
                    title: "Values",
                    doc: `Value can be a number, an array of 2 values (begin, end), a string, or an object.`,
                    numItems: 5,
                    css: `left:50px;`,
                    code: `const els = document.querySelectorAll(".el");
glide.to(els[0], 1000, {x:200});
glide.to(els[1], 1000, {x:'8rem'});
glide.to(els[2], 1000, {x:'200%'});
glide.to(els[3], 1000, {x:['10rem', 0]});
`,
                },
                {
                    title: "Object Values",
                    doc: `<p>The value can be in the form of <code>{value:'50px',<br>duration:500,<br>ease:"linear"}</code></p>
                    <p>This is useful if you want to apply different timings or easing to the same animation.</p>
                    `,
                    numItems: 1,
                    css: ``,
                    code: `glide.to(".el", 1000, {x:200, rotate:{value:180, duration:1200, ease:'cubicIn'}});`,
                },
            ]
        }
    ]


};



export default data;