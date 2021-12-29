/** todo:
 * adjust width & height automatically? or by user input?
 * get it to work with touch
 */

// localStorage.clear();
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let cells = [];//for cells
let width = 45; //45 max width for HP
let height = 19;

let cTable; //current table

let savepop; //modals open or closed
let savedpop;

const ldmode = document.getElementById('ldmode');

const wordsearch = document.getElementById('wordsearch');
const newtable = document.getElementById('newtable');
const saveTable = document.getElementById('savetable');
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
    for (let j = 0; j < /* alltables[index]. */width; j++) {
      let cell = row.insertCell(0);
      cells.push(cell);
    }
  }
}

/** Fill a table with random letters and push it to allTables */
function fillTable() {
  const tweenTable = [];
  const cellInfo = [];

  for (let i = 0; i < width * height; i++) {
    tweenTable.push(letters[Math.floor(Math.random() * letters.length)]);
    cellInfo.push(0);
  }
  const table = tweenTable.join('');
  for (let i = 0; i < width * height; i++) {
    cells[i].textContent = table.charAt(i);
  }
  allTables.push({ 'name': '', 'number': allTables.length + 1, 'table': table, 'highlit': cellInfo, width: width, height: height });
  localStorage.setItem('savedTables', JSON.stringify(allTables));
}

function ifSaved() { //If viewing saved table
  backbtn.classList.remove('none'); //show the back button
  newtable.classList.add('none'); //hide the new table button
  document.title = 'RWS - ' + tableName; //change the title
  savedName.value = allTables[shown].name; //put the name of the saved table
  seeName.classList.remove('none'); //show the name
  saveTable.classList.add('none'); //hide the save button
}

function changeName() { //change the name of a saved table
  if (shown !== null) {
    let getName = savedName.value;
    if (givename.value !== '') {
      allTables[shown].name = getName;
    }
    localStorage.setItem('all', JSON.stringify(allTables));
    saveAlert.classList.add('inlineBlock');
    shadow.style.display = 'initial';
    window.setTimeout(() => {
      saveAlert.classList.remove('inlineBlock');
      shadow.style.display = '';
    }, 400);
  }
}

function gotchem(item, defalt, type = localStorage) {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) return JSON.parse(getem);
  return defalt;
}
let allTables = gotchem('savedTables', []); //all the saved tables
let shown = gotchem('shown', null, sessionStorage); //showing a saved table or not
let tableName = gotchem('tableName', null, sessionStorage); //table name for shown
let savedyet = gotchem('savedyet', false); //newest table saved yet or not
let lightmode = gotchem('mode', true); //light or dark mode
switchMode(true);

function draw(newTable = false, idx = allTables.length - 1) {
  if (shown < allTables.length - 1 && shown !== null) {
    ifSaved();
    idx = shown;
  }
  wordsearch.innerHTML = '';
  savedTables.innerHTML = '';

  allTables.forEach((e, i) => {
    e.number = i + 1;
  });
  drawtable(wordsearch, idx);

  if (allTables.length !== 0 && !newTable) {
    let getwidth = width; //attempt to use for different size tables
    let getheight = height;

    for (let i = 0; i < getwidth * getheight; i++) {
      cells[i].textContent = allTables[idx].table[i];
      if (allTables[idx].highlit[i]) {
        cells[width * height - i - 1].style.backgroundColor = allTables[idx].highlit[i];
      }
    }
  }
  else {
    fillTable();
    idx = allTables.length - 1;
  }

  cTable = idx; //for highlighting purposes

  if (savedyet) {
    saveTable.textContent = 'Saved!';
    saveTable.disabled = true;
  }
  else {
    saveTable.textContent = 'Save';
    saveTable.disabled = false;
  }
  console.log(allTables);
}

draw();

//clicks on each letter - now with colors!
let cellnum, highlighting, newHighlightColor;
const cellID = wordsearch.getElementsByTagName('td');

/**
 * Generate a random RGB color
 * @returns {Array} An array with three random integers from 0-255 (inclusive)
 */
function randomColor() {
  const newColor = [];
  for (let i = 0; i < 3; i++) {
    newColor.push(Math.floor(Math.random() * 256));
  }
  return newColor;
}

function startDrag(e) {
  e.preventDefault();
  let cellNum; // The index of the starting cell
  let whichMove; // For adding the right event listener
  if (e.type === 'mousedown') {
    if (e.button !== 0 || !e.target.matches('td')) { // Only color on left click, and only if you start on a cell (not on a row)
      return;
    }
    cellNum = e.target.cellIndex + (e.target.closest('tr').rowIndex * width);
    whichMove = 'mousemove';
  }
  else if (e.type === 'touchstart') {
    const touchCell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    if (!touchCell.matches('td')) { // Only color if you start on a cell
      return;
    }

    cellNum = touchCell.cellIndex + (touchCell.closest('tr').rowIndex * width);
    whichMove = 'touchmove';
  }

  newHighlightColor = `rgba(${randomColor().join()}, 0.5)`;

  if (allTables[cTable].highlit[cellNum] !== newHighlightColor) {
    highlighting = true;
  }
  if (allTables[cTable].highlit[cellNum]) {
    highlighting = false
  }
  if (!allTables[cTable].highlit[cellNum]) {
    allTables[cTable].highlit[cellNum] = newHighlightColor;
    cellID[cellNum].style.backgroundColor = newHighlightColor;
  }
  else if (allTables[cTable].highlit[cellNum]) {
    allTables[cTable].highlit[cellNum] = false;
    cellID[cellNum].style.backgroundColor = 'transparent';
  }

  wordsearch.addEventListener(whichMove, whileDragging, false);
}

function whileDragging(e, type) { //added while dragging, removed when not
  if (e.target.closest('td')) {
    e.preventDefault();
    let cellnum;
    if (e.type === 'mousemove') {
      cellnum = e.target.cellIndex + (e.target.closest('tr').rowIndex * width);
    }
    else if (e.type === 'touchmove') {
      let touchcell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
      cellnum = touchcell.cellIndex + (touchcell.closest('tr').rowIndex * width);
    }
    if (allTables[cTable].highlit[cellnum] !== newHighlightColor && highlighting) {
      allTables[cTable].highlit[cellnum] = newHighlightColor;
      cellID[cellnum].style.backgroundColor = newHighlightColor;
    }
    else if (allTables[cTable].highlit[cellnum] !== newHighlightColor && !highlighting) {
      allTables[cTable].highlit[cellnum] = false;
      cellID[cellnum].style.backgroundColor = 'transparent';
    }
  }
}

function endDrag(e) {
  let whichmove = e.type === 'mouseup' ? 'mousemove' : 'touchmove';
  wordsearch.removeEventListener(whichmove, whileDragging, false);
  localStorage.setItem('savedTables', JSON.stringify(allTables));
}

wordsearch.addEventListener('mousedown', startDrag, false);
document.addEventListener('mouseup', endDrag, false);

wordsearch.addEventListener('touchstart', startDrag, false);
document.addEventListener('touchend', endDrag, false);

window.addEventListener('beforeunload', () => {
  localStorage.setItem('savedTables', JSON.stringify(allTables));
}, false);

// Make a new table
newtable.addEventListener('click', () => {
  let confNew;
  if (!savedyet) {
    confNew = confirm('Make a new table without saving?');
  }
  if (confNew || savedyet) {
    saveTable.textContent = 'Save';
    saveTable.disabled = false;
    backbtn.classList.add('none');
    savedName.textContent = '';
    document.title = 'Random Word Search';
    shown = null;
    sessionStorage.setItem('shown', JSON.stringify(shown));

    savedyet ? savedyet = false : allTables.splice(allTables.length - 1, 1);
    localStorage.setItem('savedyet', savedyet);
    localStorage.setItem('savedTables', JSON.stringify(allTables));
    draw(true);
  }
}, false);

/** Save a new table to localStorage */
function saveTheTable() {
  if (givename.value !== '' && !savedyet) {
    allTables[allTables.length - 1].name = givename.value;
    tableName = givename.value;
    sessionStorage.setItem('tableName', JSON.stringify(tableName)); // save which table the user is viewing
    shown = allTables.length - 1; //get the number of the table 
    sessionStorage.setItem('shown', JSON.stringify(shown)); //save the number of the table
    ifSaved(); //change buttons for saved
    localStorage.setItem('savedTables', JSON.stringify(allTables));
    closeAll();
    savedyet = true;
    localStorage.setItem('savedyet', JSON.stringify(savedyet));
    givename.value = '';
    // draw(); //draw the new table
  }
  saveTable.textContent = 'Saved!';
  saveTable.disabled = true;
}

// open the save table popup
saveTable.addEventListener('click', () => {
  savepopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  givename.focus();
  savepop = true;
}, false);

// Actually save the table
reallysave.addEventListener('click', saveTheTable, false);

// open the list of saved tables, and add links to all of them
saved.addEventListener('click', () => {
  allTables = gotchem('savedTables', []);
  for (let i = 0; i < allTables.length; i++) {
    allTables[i].number = i + 1;
  }
  savedpopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  savedTables.innerHTML = '';

  for (let i = allTables.length - 1; i >= 0; i--) {// minus so they end up in the right order
    if (allTables[i].name !== '') {
      let showname = document.createTextNode(allTables[i].number + '. ' + allTables[i].name);
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
      let getIndex = e.target.closest('tr').getElementsByTagName('td')[0].textContent.charAt(0) - 1;
      allTables.splice(getIndex, 1); //remove the correct table
      localStorage.setItem('savedTables', JSON.stringify(allTables)); //save that

      // Try to find a saved table to show
      if (allTables[shown - 1] !== undefined) {
        shown -= 1;
      }
      else if (allTables[shown + 1] !== undefined) {
        shown += 1;
      }
      else {
        shown = null;
      }
      sessionStorage.setItem('shown', JSON.stringify(shown));
      if (allTables.length === 0) {
        savedyet = false;
        localStorage.setItem('savedyet', JSON.stringify(savedyet));
        saveTable.textContent = 'Save';
        saveTable.disabled = false;
      }
      closeAll();
      draw(false, shown);
    }
  }
}, false);

// Delete all tables
deleteall.addEventListener('click', () => {
  let rmvallconf = confirm('Remove all saved word searches?');
  if (rmvallconf) {
    allTables.length = 0;
    localStorage.setItem('savedTables', JSON.stringify(allTables));
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAll();
  }
  else if (e.key === 'Enter' && savepop) {
    saveTheTable();
  }
}, false);

function closeAll() {
  savedpopup.style.display = 'none';
  savepopup.style.display = 'none';
  shadow.style.display = 'none';
};

//switch l/d mode
function switchMode(start = false) {
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
ldmode.addEventListener('click', function () {
  switchMode();
  lightmode = lightmode ? false : true;
  localStorage.setItem('mode', JSON.stringify(lightmode));
}, false);

//close modals on click outside
document.addEventListener('mousedown', (evt) => {
  if (evt.target.closest('.popup')) return;
  if (savepop || savedpop) { closeAll(); }
}, false);

//go back to main search from saved one
backbtn.addEventListener('click', () => {
  changeName(); //in case name was changed
  backbtn.classList.add('none');
  newtable.classList.remove('none');
  seeName.classList.add('none');
  saveTable.classList.remove('none');
  document.title = 'Random Word Search';
  shown = null;
  sessionStorage.setItem('shown', JSON.stringify(shown));
  draw();
}, false);