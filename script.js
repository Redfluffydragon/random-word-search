/**
 * todo:
 * remove previous unsaved item not working - removes item no matter what
 * add delete word search function
 * fix save button so it doesn't open the popup if that one has already been saved
 * save light/dark mode
 */
// localStorage.removeItem("saved");
let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
let tweentable = []; //push to here, then make into one string later
let table = [];//for letters
let cells = [];//for cells
let alltables = [];//for all saved tables
let cellinfo = [];
let width = 45; //45 max width for HP
let height = 19;

let shown, savedyet = false;

let clicked, savepop, savedpop;

let lightmode = true;
let ldmode = document.getElementById("ldmode");

let wordsearch = document.getElementById("wordsearch");
let newtable = document.getElementById("newtable");
let savetable = document.getElementById("savetable");
let saved = document.getElementById("saved");
let deleteall = document.getElementById("deleteall");
let savedpopup = document.getElementById("savedpopup");
let popups = document.getElementById("popups");
let seesaved = document.getElementById("seesaved");

let savepopup = document.getElementById("savepopup");
let givename = document.getElementById("givename");
let reallysave = document.getElementById("reallysave");

let shadow = document.getElementById("shadow");

function drawtable(table, index) {
    wordsearch.innerHTML = "";
    cells.length = 0;
    for (let i = 0; i < /* alltables[index]. */height; i++) {
        let row = table.insertRow(0);
        for(let j = 0; j < /* alltables[index]. */width; j++) {
            let cell = row.insertCell(0);
            cells.push(cell);
        }
    }
}

function filltable() {
    tweentable.length = 0;
    for (let i = 0; i < width*height; i++) {
        let randomLetter = Math.round(Math.random()*25);
        tweentable.push(letters[randomLetter]);
        cellinfo.push(0);
    }
    table = tweentable.join("");
    for (let i = 0; i < width*height; i++) {
        cells[i].textContent = table.charAt(i);
    }
    alltables.push({"name": "", "number": alltables.length+1, "table": table, "highlit": cellinfo, width: width, height: height});
    localStorage.setItem("saved", JSON.stringify(alltables));
}

function draw(newTable) {
    wordsearch.innerHTML = "";
    seesaved.innerHTML = "";

    for (let i = 0; i < alltables.length; i++) {
        alltables[i].number = i+1;
    }

    let getall = localStorage.getItem("saved");
    if (getall !== null) {
        alltables = JSON.parse(getall);
        console.log(alltables);
    }
    let getlen = alltables.length-1;
    drawtable(wordsearch, getlen);

    if (alltables.length !== 0 && !newTable) {
        let getwidth = alltables[getlen].width;
        let getheight = alltables[getlen].height;

        for (let i = 0; i < getwidth*getheight; i++) {
            cells[i].textContent = alltables[getlen].table[i];
            if (alltables[getlen].highlit[i]) {
                cells[width*height-i-1].style.backgroundColor = alltables[getlen].highlit[i];
            }
        }
    }
    else { filltable(); }

    allclicks();

    localStorage.setItem("saved", JSON.stringify(alltables));

    let yet = localStorage.getItem("savedyet");
    if (yet !== null) {
        savedyet = JSON.parse(yet);
    }
    if (savedyet) {
        savetable.textContent = "Saved!";
        savetable.disabled = true;
    }
}

draw(false);

//clicks on each letter - now with colors!
function allclicks() {
    let downmouse, highlighting, getcolor;
    let makolor = [];
    let cellID = wordsearch.getElementsByTagName('td');
    let len = alltables.length-1;
    for (let i = 0; i < cellID.length; i++) {
        cellID[i].onmousedown = function() {
            makolor.length = 0;
            for (let i = 0; i < 3; i++) {
                let randomcolor = Math.round(Math.random()*255);
                makolor.push(randomcolor);
            }
            getcolor = "rgb(" + makolor.join() + ")";
            console.log(getcolor);
            if (alltables[len].highlit[i] !== getcolor) {highlighting = true;}
            if (alltables[len].highlit[i]) {highlighting = false};
            downmouse = true;
            if (!alltables[len].highlit[i]) {
                alltables[len].highlit[i] = getcolor;
                cellID[i].style.backgroundColor = getcolor;
            }
            else if (alltables[len].highlit[i]) {
                alltables[len].highlit[i] = false;
                cellID[i].style.backgroundColor = "transparent";
            }
        }
        cellID[i].onmouseover = function() {
            if (downmouse) {
                if (alltables[len].highlit[i] !== getcolor && highlighting) {
                    alltables[len].highlit[i] = getcolor;
                    cellID[i].style.backgroundColor = getcolor;
                }
                else if (alltables[len].highlit[i] !== getcolor && !highlighting) {
                    alltables[len].highlit[i] = false;
                    cellID[i].style.backgroundColor = "transparent";
                }
            }
        }
    }
    wordsearch.onmouseup = function() {
        downmouse = false;
        let selected = window.getSelection();
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            selected.modify();
        }
    }
}

document.addEventListener("mouseup", function() {
    localStorage.setItem("saved", JSON.stringify(alltables));
}, false);

function reverseString(verse) {
    let reversed = verse.split("").reverse().join("");
    return reversed;
}

function linebreaks(strin) {
    let splitted = strin.split("");
    for (let i = 0; i < height; i++) {
        splitted.splice((i+1)*height, "\n");
    }
    let broken = splitted.join("");
    return broken;
}

//make a new table
newtable.addEventListener("click", function() {
    savetable.textContent = "Save";
    savetable.disabled = false;
    if (!savedyet) {
        alltables.splice(alltables.length-1, 1); //remove the previous one if it wasn't saved
        savedyet = false;
    }
    else if (savedyet) {
        savedyet = false;
    }
    localStorage.setItem("savedyet", savedyet);
    localStorage.setItem("saved", JSON.stringify(alltables));
    draw(true);
}, false);

function saveTheTable() {
    if (givename.value !== "" && !savedyet) {
        alltables[alltables.length-1].name = givename.value;
        localStorage.setItem("saved", JSON.stringify(alltables));
        closeAll();
        savedyet = true;
        localStorage.setItem("savedyet", JSON.stringify(savedyet));
    }
    savetable.textContent = "Saved!";
    savetable.disabled = true;
}

//open the save table popup
savetable.addEventListener("click", function() {
    if (!savedyet) {
        savepopup.style.display = "inline-block";
        shadow.style.display = "initial";
        givename.focus();
    }
    clicked = true;
}, false);

//actually save the table
reallysave.addEventListener("click", saveTheTable, false);

//open the list of saved tables, and add links to all of them
saved.addEventListener("click", function() {
    let getsaved = localStorage.getItem("saved");
    if (getsaved !== null) {
        alltables = JSON.parse(getsaved);
    }
    for (let i = 0; i < alltables.length; i++) {
        alltables[i].number = i+1;
    }
    savedpopup.style.display = "inline-block";
    shadow.style.display = "initial";
    seesaved.innerHTML = "";
    for (let i = 0; i < alltables.length; i++) {
        if (alltables[i].name !== "") {
            let liel = document.createElement("li");
            let showname = document.createTextNode(alltables[i].number + ". " +alltables[i].name);
            let seebutton = document.createElement("a");
            seebutton.className = "seebutton";
            seebutton.appendChild(showname);
            liel.appendChild(seebutton);
            seesaved.appendChild(liel);
        }
    }
    let seebutton = seesaved.getElementsByTagName("li");
    for (let i = 0; i < seebutton.length; i ++) {
        seebutton[i].onclick = function() {
            shown = seebutton[i].textContent.charAt(0);
            localStorage.setItem("shown", JSON.stringify(shown));
            let newin = window.open('displaysaved.html', '_blank').focus(); // to open in a new tab
            closeAll();
        }
    }
    clicked = true;
}, false);

//delete all tables
deleteall.addEventListener("click", function() {
    let rmvallconf = confirm("Remove all saved word searches?");
    if (rmvallconf) {
        alltables.length = 0;
        localStorage.setItem("saved", JSON.stringify(alltables));
        // drawtable();
        // filltable();
        draw();
        savedyet = false;
        localStorage.setItem("savedyet", JSON.stringify(savedyet));
    }
}, false);

//close popups
document.addEventListener("keydown", function(e) {
    if (e.keyCode === 27) { closeAll(); }
    if (e.keyCode === 13) { saveTheTable(); }
}, false);

function closeAll() {
    savedpopup.style.display = "none";
    savepopup.style.display = "none";
    shadow.style.display = "none";
};

//light/dark mode
ldmode.addEventListener("click", function()  {
    let head = document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';
    if (!lightmode) {
        document.body.style.backgroundColor = "white";
        css = 'html {-webkit-filter: invert(0%); -moz-filter: invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }'
        lightmode = true;
    }
    else if (lightmode) {
        document.body.style.backgroundColor = "black";
        css = 'html {-webkit-filter: invert(100%);' + '-moz-filter: invert(100%);' + '-o-filter: invert(100%);' + '-ms-filter: invert(100%); }';
        lightmode = false;
    }
    style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
    
    head.appendChild(style);
}, false);

//close modals on click outside
document.addEventListener("click", (evt) => { 
    if(evt.target.closest(".popup")) return;
    if ((savepop || savedpop) && !clicked) { closeAll(); }
    else if (clicked) {
      savepop = true;
      savedpop = true;
      clicked = false;
    }
  }, false);
