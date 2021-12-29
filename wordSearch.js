/** todo:
 * adjust width & height automatically? or by user input?
 * get it to work with touch
 */

// localStorage.clear();
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
let cells = []; // for cells
let width = 45; // 45 max width for HP
let height = 19;

let cTable; // current table index

let savepop; // modals open or closed
let savedpop;

const ldmode = document.getElementById('ldmode');

const wordsearch = document.getElementById('wordsearch');
const cellID = wordsearch.getElementsByTagName('td');
const newtable = document.getElementById('newtable');
const saveTable = document.getElementById('savetable');
const saved = document.getElementById('saved');
const deleteAll = document.getElementById('deleteall');
const savedpopup = document.getElementById('savedpopup');
const popups = document.getElementById('popups');
const savedTables = document.getElementById('savedTables');

const copyMenu = document.getElementById('copyMenu');
const copyBtn = document.getElementById('copyBtn');
const copyBackwardsBtn = document.getElementById('copyBackwardsBtn');

const savepopup = document.getElementById('savepopup');
const givename = document.getElementById('givename');
const reallySave = document.getElementById('reallysave');

const saveAlert = document.getElementById('saveAlert');

const backbtn = document.getElementById('backbtn');
const savedName = document.getElementById('savedName');
const seeName = document.getElementById('seeName');

const shadow = document.getElementById('shadow');

const everything = document.getElementById('everything');

const isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);

let allTables;
let shown;
let tableName;
let savedyet;
let lightmode;

// For clicks on each letter - now with colors!
let copyCellColor, highlighting, newHighlightColor;

window.addEventListener('load', () => {
  allTables = gotchem('savedTables', []); // all the saved tables
  shown = gotchem('shown', null, sessionStorage); // showing a saved table or not
  tableName = gotchem('tableName', null, sessionStorage); // table name for shown
  savedyet = gotchem('savedyet', false); // newest table saved yet or not
  lightmode = gotchem('mode', true); // light or dark mode

  switchMode(true);
  draw();

  wordsearch.addEventListener('mousedown', startDrag, false);
  document.addEventListener('mouseup', endDrag, false);

  wordsearch.addEventListener('touchstart', startDrag, false);
  document.addEventListener('touchend', endDrag, false);

  // Actually save the table
  reallySave.addEventListener('click', saveTheTable, false);

  // Hide the custom copy menu if you do anything else
  document.addEventListener('touchstart', resetCopyMenu, false);

  copyBtn.addEventListener('click', () => {
    copyWord('forwards');
  }, false);

  copyBackwardsBtn.addEventListener('click', () => {
    copyWord('backwards');
  }, false);
}, false);

// Open copy menu on right click
wordsearch.addEventListener('contextmenu', e => {
  if (!e.target.matches('td')) { // Only copy if you right click on a cell
    return;
  }
  e.preventDefault();

  copyMenu.classList.remove('none');
  copyMenu.style.left = e.clientX + 'px';
  copyMenu.style.top = e.clientY + 'px';

  const cellIdx = e.target.cellIndex + (e.target.closest('tr').rowIndex * width);
  copyCellColor = allTables[cTable].highlit[cellIdx];
  if (!copyCellColor) {
    copyBtn.disabled = true;
    copyBackwardsBtn.disabled = true;
  }
}, false);

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

// open the save table popup
saveTable.addEventListener('click', () => {
  savepopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  givename.focus();
  savepop = true;
}, false);

// open the list of saved tables, and add links to all of them
saved.addEventListener('click', () => {
  allTables = gotchem('savedTables', []);
  for (let i = 0; i < allTables.length; i++) {
    allTables[i].number = i + 1;
  }
  savedpopup.style.display = 'inline-block';
  shadow.style.display = 'initial';
  savedTables.innerHTML = '';

  for (let i = allTables.length - 1; i >= 0; i--) { // minus so they end up in the right order
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
deleteAll.addEventListener('click', () => {
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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAll();
  }
  else if (e.key === 'Enter' && savepop) {
    saveTheTable();
  }
}, false);

//light/dark mode
ldmode.addEventListener('click', () => {
  switchMode();
  lightmode = lightmode ? false : true;
  localStorage.setItem('mode', JSON.stringify(lightmode));
}, false);

//close modals on click outside
document.addEventListener('mousedown', e => {
  resetCopyMenu(e); // Reset the copy menu if you do anything else
  if (e.target.closest('.popup')) {
    return;
  }
  if (savepop || savedpop) {
    closeAll();
  }
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