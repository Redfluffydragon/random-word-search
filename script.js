/**
 * todo:
 * add delete single word search function
 * save light/dark mode
 * adjust width & height automatically? or by user input?
 */

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let tweentable = []; //push to here, then make into one string later
let table = [];//for letters
let cells = [];//for cells
let alltables = [];//for all saved tables
let cellinfo = []; //highlighted or not
let width = 45; //45 max width for HP
let height = 19;

let shown;
let savedyet = false;
let tableName;

let clicked;
let savepop;
let savedpop;

let lightmode = true;
let ldmode = document.getElementById('ldmode');

let wordsearch = document.getElementById('wordsearch');
let newtable = document.getElementById('newtable');
let savetable = document.getElementById('savetable');
let saved = document.getElementById('saved');
let deleteall = document.getElementById('deleteall');
let savedpopup = document.getElementById('savedpopup');
let popups = document.getElementById('popups');
let seesaved = document.getElementById('seesaved');

let savepopup = document.getElementById('savepopup');
let givename = document.getElementById('givename');
let reallysave = document.getElementById('reallysave');

let backbtn = document.getElementById('backbtn');
let savedName = document.getElementById('savedName');

let shadow = document.getElementById('shadow');

let isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);

function drawtable(table, index) {
    wordsearch.innerHTML = '';
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
    table = tweentable.join('');
    for (let i = 0; i < width*height; i++) {
        cells[i].textContent = table.charAt(i);
    }
    alltables.push({'name': '', 'number': alltables.length+1, 'table': table, 'highlit': cellinfo, width: width, height: height});
    localStorage.setItem('saved', JSON.stringify(alltables));
}

function ifSaved() {
    backbtn.classList.remove('none');
    document.title = 'RWS - ' + tableName;
    savedName.textContent = 'Saved Search: ' + tableName;
}

function gotchem(item, defalt, type=localStorage) {
    let getem = type.getItem(item);
    if (getem !== null && JSON.parse(getem) !== undefined) {
        return JSON.parse(getem);
    }
    else { return defalt; }
}
alltables = gotchem('saved', []);
shown = gotchem('shown', null, sessionStorage);
tableName = gotchem('tableName', null, sessionStorage);
savedyet = gotchem('savedyet', false);

function draw(newTable=false, idx=alltables.length-1) {
    if (shown !== alltables.length-1 && shown !== null) {
        ifSaved();
        idx = shown;
    }
    wordsearch.innerHTML = '';
    seesaved.innerHTML = '';

    for (let i = 0; i < alltables.length; i++) {
        alltables[i].number = i+1;
    }

    drawtable(wordsearch, idx);

    if (alltables.length !== 0 && !newTable) {
        // let getwidth = alltables[idx].width;
        // let getheight = alltables[idx].height;
        let getwidth = width
        let getheight = height;

        for (let i = 0; i < getwidth*getheight; i++) {
            cells[i].textContent = alltables[idx].table[i];
            if (alltables[idx].highlit[i]) {
                cells[width*height-i-1].style.backgroundColor = alltables[idx].highlit[i];
            }
        }
    }
    else { filltable(); }

    allclicks(idx);

    localStorage.setItem('saved', JSON.stringify(alltables));

    if (savedyet) {
        savetable.textContent = 'Saved!';
        savetable.disabled = true;
    }
}

draw();

//clicks on each letter - now with colors!
function allclicks(table=alltables.length-1) {
    let downmouse, highlighting, getcolor;
    let makolor = [];
    let cellID = wordsearch.getElementsByTagName('td');
    let len = table;
    for (let i = 0; i < cellID.length; i++) {
        cellID[i].addEventListener('mousedown', () => {
            makolor.length = 0;
            for (let i = 0; i < 3; i++) {
                let randomcolor = Math.round(Math.random()*255);
                makolor.push(randomcolor);
            }
            getcolor = 'rgba(' + makolor.join() + ', 0.5)';
            if (alltables[len].highlit[i] !== getcolor) {highlighting = true;}
            if (alltables[len].highlit[i]) {highlighting = false};
            downmouse = true;
            if (!alltables[len].highlit[i]) {
                alltables[len].highlit[i] = getcolor;
                cellID[i].style.backgroundColor = getcolor;
            }
            else if (alltables[len].highlit[i]) {
                alltables[len].highlit[i] = false;
                cellID[i].style.backgroundColor = 'transparent';
            }
        }, false);
        cellID[i].addEventListener('mousemove', () => {
            if (downmouse) {
                if (alltables[len].highlit[i] !== getcolor && highlighting) {
                    alltables[len].highlit[i] = getcolor;
                    cellID[i].style.backgroundColor = getcolor;
                }
                else if (alltables[len].highlit[i] !== getcolor && !highlighting) {
                    alltables[len].highlit[i] = false;
                    cellID[i].style.backgroundColor = 'transparent';
                }
            }
        }, false);
    }
    wordsearch.addEventListener('mouseup', () => {
        downmouse = false;
    }, false);
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('saved', JSON.stringify(alltables));
}, false);

//make a new table
newtable.addEventListener('click', function() {
    savetable.textContent = 'Save';
    savetable.disabled = false;
    if (!savedyet) {
        alltables.splice(alltables.length-1, 1); //remove the previous one if it wasn't saved
        savedyet = false;
    }
    else if (savedyet) {
        savedyet = false;
    }
    localStorage.setItem('savedyet', savedyet);
    localStorage.setItem('saved', JSON.stringify(alltables));
    draw(true);
}, false);

function saveTheTable() {
    if (givename.value !== '' && !savedyet) {
        alltables[alltables.length-1].name = givename.value;
        localStorage.setItem('saved', JSON.stringify(alltables));
        closeAll();
        savedyet = true;
        localStorage.setItem('savedyet', JSON.stringify(savedyet));
    }
    savetable.textContent = 'Saved!';
    savetable.disabled = true;
}

//open the save table popup
savetable.addEventListener('click', function() {
    if (!savedyet) {
        savepopup.style.display = 'inline-block';
        shadow.style.display = 'initial';
        givename.focus();
    }
    clicked = true;
}, false);

//actually save the table
reallysave.addEventListener('click', saveTheTable, false);

//open the list of saved tables, and add links to all of them
saved.addEventListener('click', function() {
    let getsaved = localStorage.getItem('saved');
    if (getsaved !== null) {
        alltables = JSON.parse(getsaved);
    }
    for (let i = 0; i < alltables.length; i++) {
        alltables[i].number = i+1;
    }
    savedpopup.style.display = 'inline-block';
    shadow.style.display = 'initial';
    seesaved.innerHTML = '';
    for (let i = 0; i < alltables.length; i++) {
        if (alltables[i].name !== '') {
            let liel = document.createElement('li');
            let showname = document.createTextNode(alltables[i].number + '. ' + alltables[i].name);
            liel.appendChild(showname);
            seesaved.appendChild(liel);
        }
    }
    let seebutton = seesaved.getElementsByTagName('li');
    for (let i = 0; i < seebutton.length; i ++) {
        seebutton[i].onclick = () => {
            tableName = seebutton[i].textContent.slice(3);
            sessionStorage.setItem('tableName', JSON.stringify(tableName));
            ifSaved();
            shown = seebutton[i].textContent.charAt(0) - 1;
            sessionStorage.setItem('shown', JSON.stringify(shown));
            draw(false, shown);
            closeAll();
        }
    }
    clicked = true;
}, false);

//delete all tables
deleteall.addEventListener('click', function() {
    let rmvallconf = confirm('Remove all saved word searches?');
    if (rmvallconf) {
        alltables.length = 0;
        localStorage.setItem('saved', JSON.stringify(alltables));
        draw();
        savedyet = false;
        localStorage.setItem('savedyet', JSON.stringify(savedyet));
    }
}, false);

//close popups
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 27) { closeAll(); }
    if (e.keyCode === 13) { saveTheTable(); }
}, false);

function closeAll() {
    savedpopup.style.display = 'none';
    savepopup.style.display = 'none';
    shadow.style.display = 'none';
};

//light/dark mode
ldmode.addEventListener('click', function()  {
    let head = document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';
    if (!lightmode) {
        document.body.style.backgroundColor = 'white';
        wordsearch.style.color = 'black';
        shadow.style.backgroundColor = '';
        css = 'html {-webkit-filter: invert(0%); -moz-filter: invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }'
        lightmode = true;
    }
    else if (lightmode) {
        document.body.style.backgroundColor = 'black';
        wordsearch.style.color = 'gray';
        shadow.style.backgroundColor = '#FFFFFF99';
        css = 'html {-webkit-filter: invert(100%);' + '-moz-filter: invert(100%);' + '-o-filter: invert(100%);' + '-ms-filter: invert(100%); }';
        lightmode = false;
    }
    style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));
    
    head.appendChild(style);
}, false);

//close modals on click outside
document.addEventListener('click', (evt) => { 
    if(evt.target.closest('.popup')) return;
    if ((savepop || savedpop) && !clicked) { closeAll(); }
    else if (clicked) {
      savepop = true;
      savedpop = true;
      clicked = false;
    }
}, false);

//go back to main search from saved one
backbtn.addEventListener('click', () => {
    backbtn.classList.add('none');
    savedName.textContent = '';
    document.title = 'Random Word Search';
    shown = null;
    sessionStorage.setItem('shown', JSON.stringify(shown));
    draw();
}, false);