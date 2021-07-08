const codeMirror = CodeMirror(document.querySelector(".code"), {
    value: "function myScript(){return 100;}\n",
    mode:  "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    lineWrapping: true,
    //styleActiveSelected: true,
    theme: "lucario",
    // theme: "mdn-like",
    // theme: "mdn-like",
    autoCloseBrackets: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: { 'esversion': '8' },
});
codeMirror.setSize(null, "100%");