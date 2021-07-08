import data from "./assets/data.js";

let nav, stage, codeMirror, aside, dataMap = {};

function setEditor() {
    codeMirror = CodeMirror(document.querySelector(".code"), {
        value: "function myScript(){return 100 + 200;}\n",
        mode:  "javascript",
        lineNumbers: true,
        styleActiveLine: true,
        lineWrapping: true,
        //styleActiveSelected: true,
        // theme: "lucario",
        // theme: "mdn-like",
        theme: "darcula",
        autoCloseBrackets: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: { 'esversion': '8' },
    });
    codeMirror.setSize(null, "100%");
}


function parseData() {

    let str = "";

    for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        str += `<h3>${section.title}</h3>`;
        for (let j = 0; j < section.content.length; j++) {
            const item = section.content[j];
            str += `<div data-id="${i}">${item.title}</div>`;
            dataMap[i] = item;
        }

    }

    nav.innerHTML = str;

}

function setListeners() {
    nav.addEventListener("click", loadAnimation);
}

function loadAnimation(e) {
    const id = e.target.getAttribute("data-id");
    if (!id) return;
    let item = dataMap[id];
    codeMirror.setValue(item.code);
}



window.onload = ()=> {

    nav = document.querySelector("nav");
    stage = document.querySelector(".stage");
    aside = document.querySelector("aside");

    setEditor();
    parseData();
    setListeners();


};
















