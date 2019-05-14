/** todo:
 * adjust width & height automatically? or by user input?
 * get it to work with touch
 */

// localStorage.clear();
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let tweentable = []; //push to here, then make into one string later
let table = [];//for letters
let cells = [];//for cells
let cellinfo = []; //highlighted or not
let width = 45; //45 max width for HP
let height = 19;

let cTable; //current table

let savepop; //modals open or closed
let savedpop;

const ldmode = document.getElementById('ldmode');

const wordsearch = document.getElementById('wordsearch');
const newtable = document.getElementById('newtable');
const savetable = document.getElementById('savetable');
const saved = document.getElementById('saved');
const deleteall = document.getElementById('deleteall');
const savedpopup = document.getElementById('savedpopup');
const popups = document.getElementById('popups');
const savedTables = document.getElementById('savedTables');

const savepopup = document.getElementById('savepopup');
const givename = document.getElementById('givename');
const reallysave = document.getElementById('reallysave');

const saveAlert = document.getElementById('saveAlert'); 

const backbtn = document.getElementById('backbtn');
const savedName = document.getElementById('savedName');
const seeName = document.getElementById('seeName');

const shadow = document.getElementById('shadow');

const everything = document.getElementById('everything');

const isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);

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

function ifSaved() { //If viewing saved table
  backbtn.classList.remove('none'); //show the back button
  newtable.classList.add('none'); //hide the new table button
  document.title = 'RWS - ' + tableName; //change the title
  savedName.value = alltables[shown].name; //put the name of the saved table
  seeName.classList.remove('none'); //show the name
  savetable.classList.add('none'); //hide the save button
}

function changeName() { //change the name of a saved table
  if (shown !== null) {
    let getName = savedName.value;
    if (givename.value !== '') {
      alltables[shown].name = getName;
    }
    localStorage.setItem('all', JSON.stringify(alltables));
    saveAlert.classList.add('inlineBlock');
    shadow.style.display = 'initial';
    window.setTimeout(() => {
      saveAlert.classList.remove('inlineBlock');
      shadow.style.display = '';
    }, 400);
  }
}

function gotchem(item, defalt, type=localStorage) {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) return JSON.parse(getem);
  return defalt; 
}
let alltables = gotchem('saved', []); //all the saved tables
let shown = gotchem('shown', null, sessionStorage); //showing a saved table or not
let tableName = gotchem('tableName', null, sessionStorage); //table name for shown
let savedyet = gotchem('savedyet', false); //newest table saved yet or not
let lightmode = gotchem('mode', true); //light or dark mode
switchMode(true);

function draw(newTable=false, idx=alltables.length-1) {
  if (shown < alltables.length-1 && shown !== null) {
    ifSaved();
    idx = shown;
  }
  wordsearch.innerHTML = '';
  savedTables.innerHTML = '';

  alltables.forEach((e, i) => {
    e.number = i+1;
  })
  drawtable(wordsearch, idx);

  if (alltables.length !== 0 && !newTable) {
    let getwidth = width; //attempt to use for different size tables
    let getheight = height;
    
    for (let i = 0; i < getwidth*getheight; i++) {
      cells[i].textContent = alltables[idx].table[i];
      if (alltables[idx].highlit[i]) {
        cells[width*height-i-1].style.backgroundColor = alltables[idx].highlit[i];
      }
    }
  }
  else { filltable(); idx = alltables.length-1; }

  cTable = idx; //for highlighting purposes

  if (savedyet) {
    savetable.textContent = 'Saved!';
    savetable.disabled = true;
  }
  else {
    savetable.textContent = 'Save';
    savetable.disabled = false;
  }
  console.log(alltables);
}

draw();

//clicks on each letter - now with colors!
let cellnum, highlighting, getcolor;
let cellID = wordsearch.getElementsByTagName('td');
function startDrag(e) {
  e.preventDefault();
  let cellnum;
  let whichmove;
  if (e.type === 'mousedown') {
    cellnum = e.target.cellIndex + (e.target.closest('tr').rowIndex*width);
    whichmove = 'mousemove';
  }
  else if (e.type === 'touchstart') {
    let touchcell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
    cellnum = touchcell.cellIndex + (touchcell.closest('tr').rowIndex*width);
    whichmove = 'touchmove';
  }
  let makolor = [];
  makolor.length = 0;
  for (let i = 0; i < 3; i++) {
    let randomcolor = Math.round(Math.random()*255);
    makolor.push(randomcolor);
  }
  getcolor = 'rgba(' + makolor.join() + ', 0.5)';
  if (alltables[cTable].highlit[cellnum] !== getcolor) {highlighting = true;}
  if (alltables[cTable].highlit[cellnum]) {highlighting = false};
  if (!alltables[cTable].highlit[cellnum]) {
    alltables[cTable].highlit[cellnum] = getcolor;
    cellID[cellnum].style.backgroundColor = getcolor;
  }
  else if (alltables[cTable].highlit[cellnum]) {
    alltables[cTable].highlit[cellnum] = false;
    cellID[cellnum].style.backgroundColor = 'transparent';
  }
  wordsearch.addEventListener(whichmove, whileDragging, false);
}
function whileDragging(e, type) { //added while dragging, removed when not
  if (e.target.closest('td')) {
    e.preventDefault();
    let cellnum;
    if (e.type === 'mousemove') {
      cellnum = e.target.cellIndex + (e.target.closest('tr').rowIndex*width);
    }
    else if (e.type === 'touchmove') {
      let touchcell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
      cellnum = touchcell.cellIndex + (touchcell.closest('tr').rowIndex*width);
    }
    if (alltables[cTable].highlit[cellnum] !== getcolor && highlighting) {
      alltables[cTable].highlit[cellnum] = getcolor;
      cellID[cellnum].style.backgroundColor = getcolor;
    }
    else if (alltables[cTable].highlit[cellnum] !== getcolor && !highlighting) {
      alltables[cTable].highlit[cellnum] = false;
      cellID[cellnum].style.backgroundColor = 'transparent';
    }
  }
}
function endDrag(e) {
  let whichmove = e.type === 'mouseup' ? 'mousemove' : 'touchmove';
  wordsearch.removeEventListener(whichmove, whileDragging, false);
  localStorage.setItem('saved', JSON.stringify(alltables));
}
wordsearch.addEventListener('mousedown', startDrag, false);
wordsearch.addEventListener('mouseup', endDrag, false);

wordsearch.addEventListener('touchstart', startDrag, false);
wordsearch.addEventListener('touchend', endDrag, false);

window.addEventListener('beforeunload', () => {
  localStorage.setItem('saved', JSON.stringify(alltables));
}, false);

//make a new table
newtable.addEventListener('click', function() {
  let confNew;
  if (!savedyet) {
    confNew = confirm('Make a new table without saving?');
  }
  if (confNew || savedyet) {
    savetable.textContent = 'Save';
    savetable.disabled = false;
    backbtn.classList.add('none');
    savedName.textContent = '';
    document.title = 'Random Word Search';
    shown = null;
    sessionStorage.setItem('shown', JSON.stringify(shown));

    savedyet ? savedyet = false : alltables.splice(alltables.length-1, 1);
    localStorage.setItem('savedyet', savedyet);
    localStorage.setItem('saved', JSON.stringify(alltables));
    draw(true);
  }
}, false);

function saveTheTable() { //save a new table
  if (givename.value !== '' && !savedyet) {
    alltables[alltables.length-1].name = givename.value;
    tableName = givename.value;
    sessionStorage.setItem('tableName', JSON.stringify(tableName)); // save which table the user is viewing
    shown = alltables.length - 1; //get the number of the table 
    sessionStorage.setItem('shown', JSON.stringify(shown)); //save the number of the table
    ifSaved(); //change buttons for saved
    localStorage.setItem('saved', JSON.stringify(alltables));
    closeAll();
    savedyet = true;
    localStorage.setItem('savedyet', JSON.stringify(savedyet));
    givename.value = '';
    // draw(); //draw the new table
  }
  savetable.textContent = 'Saved!';
  savetable.disabled = true;
}

//open the save table popup
savetable.addEventListener('click', function() {
  savepopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  givename.focus();
  savepop = true;
}, false);

//actually save the table
reallysave.addEventListener('click', saveTheTable, false);

//open the list of saved tables, and add links to all of them
saved.addEventListener('click', function() {
  alltables = gotchem('saved', []);
  for (let i = 0; i < alltables.length; i++) {
    alltables[i].number = i+1;
  }
  savedpopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  savedTables.innerHTML = '';
  for (let i = alltables.length-1; i > -1; i--) {//minus so they end up in the right order
    if (alltables[i].name !== '') {
      let showname = document.createTextNode(alltables[i].number + '. ' + alltables[i].name);
      let row = savedTables.insertRow(0);
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      let dltbtn = document.createElement('button');
      let dlttxt = document.createTextNode('Delete');
      dltbtn.appendChild(dlttxt);
      dltbtn.className = 'dltbtns';
      cell0.className = 'goandsee';
      cell1.appendChild(dltbtn);
      cell0.appendChild(showname);
    }
  }
  savedpop = true;
}, false);

//clicks on table of saved tables
savedTables.addEventListener('click', e => {
  if (e.target.matches('.goandsee')) {
    changeName(); //in case the name was changed?
    tableName = e.target.textContent.slice(3); //get just the name
    sessionStorage.setItem('tableName', JSON.stringify(tableName)); // save which table the user is viewing
    shown = e.target.textContent.charAt(0) - 1; //get the number of the table 
    sessionStorage.setItem('shown', JSON.stringify(shown)); //save the number of the table
    ifSaved(); //change buttons for saved
    draw(false, shown); //draw the new table
    closeAll(); //close the modal
  }
  else if (e.target.matches('.dltbtns')) {
    let confDelete = confirm(`Delete your saved word search "${tableName}"?`);
    if (confDelete) {
      let getIndex = e.target.closest('tr').getElementsByTagName('td')[0].textContent.charAt(0)-1;
      alltables.splice(getIndex, 1); //remove the right table
      localStorage.setItem('saved', JSON.stringify(alltables)); //save that
      if (alltables[shown-1] !== undefined) {
        shown -= 1;
      }
      else if (alltables[shown+1] !== undefined) {
        shown += 1;
      }
      else {
        shown = null;
      }
      sessionStorage.setItem('shown', JSON.stringify(shown));
      if (alltables.length === 0) {
        savedyet = false; 
        localStorage.setItem('savedyet', JSON.stringify(savedyet));
        savetable.textContent = 'Save';
        savetable.disabled = false;
      }
      closeAll();
      draw(false, shown);
    }
  }
}, false);

//delete all tables
deleteall.addEventListener('click', function() {
  let rmvallconf = confirm('Remove all saved word searches?');
  if (rmvallconf) {
    alltables.length = 0;
    localStorage.setItem('saved', JSON.stringify(alltables));
    savedyet = false;
    localStorage.setItem('savedyet', JSON.stringify(savedyet));
    backbtn.classList.add('none');
    savedName.textContent = '';
    document.title = 'Random Word Search';
    shown = null;
    sessionStorage.setItem('shown', JSON.stringify(shown));
    draw();
  }
}, false);

document.addEventListener('keydown', function(e) {
  if (e.keyCode === 27) { closeAll(); }
  if (e.keyCode === 13 && savepop) { saveTheTable(); }
}, false);

function closeAll() {
  savedpopup.style.display = 'none';
  savepopup.style.display = 'none';
  shadow.style.display = 'none';
};

//switch l/d mode
function switchMode(start=false) {
  if (lightmode === start) {
    document.body.style.backgroundColor = 'white';
    wordsearch.style.color = 'black';
    shadow.style.backgroundColor = '';
    everything.classList.remove('invert');
  }
  else if (lightmode !== start) {
    document.body.style.backgroundColor = 'black';
    wordsearch.style.color = 'gray';
    shadow.style.backgroundColor = '#FFFFFF99';
    everything.classList.add('invert');
  }
}

//light/dark mode
ldmode.addEventListener('click', function()  {
  switchMode();
  lightmode = lightmode ? false : true;
  localStorage.setItem('mode', JSON.stringify(lightmode));
}, false);

//close modals on click outside
document.addEventListener('mousedown', (evt) => { 
  if(evt.target.closest('.popup')) return;
  if (savepop || savedpop) { closeAll(); }
}, false);

//go back to main search from saved one
backbtn.addEventListener('click', () => {
  changeName(); //in case name was changed
  backbtn.classList.add('none');
  newtable.classList.remove('none');
  seeName.classList.add('none');
  savetable.classList.remove('none');
  document.title = 'Random Word Search';
  shown = null;
  sessionStorage.setItem('shown', JSON.stringify(shown));
  draw();
}, false);