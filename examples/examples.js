import data from "./assets/data.js";
import glide from "./libs/glide.esm.js";

let nav, stage, codeMirror, aside, dataMap = {}, currentId = 0;

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
    let n = 0;
    for (let i = 0; i < data.sections.length; i++) {
        const section = data.sections[i];
        str += `<h3>${section.title}</h3>`;
        for (let j = 0; j < section.content.length; j++) {
            const item = section.content[j];
            str += `<div class="nav-item" data-id="${n}">${item.title}</div>`;
            dataMap[n] = item;
            n++;
        }

    }

    nav.innerHTML = str;

}

function setListeners() {

    nav.addEventListener("click", (e)=> {
        const id = e.target.getAttribute("data-id");
        if (!id) return;
        loadAnimation(id);
        runAnimation();
    });

    stage.addEventListener("click", runAnimation);

}

function loadAnimation(id) {

    let item = dataMap[id];
    codeMirror.setValue(item.code);
    aside.innerHTML = item.doc;
    currentId = id;
    const newItem = document.querySelector(`.nav-item[data-id='${id}']`);
    const oldItem = document.querySelector(".selected");
    if (oldItem) oldItem.classList.remove("selected");
    newItem.classList.add("selected");
}

function runAnimation() {
    let item = dataMap[currentId];
    let str = "";
    for (let i = 0; i < item.numItems; i++) {
        const style = item.css? `style='${item.css}'` : "";
        str += `<div class="el" ${style}></div>`;
    }
    stage.innerHTML = str;

    try {
        eval(codeMirror.getValue());

    } catch (err) {
        console.log(err);
        alert(err);
    }
}



window.onload = ()=> {

    nav = document.querySelector("nav");
    stage = document.querySelector(".stage");
    aside = document.querySelector("aside");

    setEditor();
    parseData();
    setListeners();
    loadAnimation("0");
    runAnimation();

};
















