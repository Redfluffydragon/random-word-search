/** todo:
 * adjust width & height automatically? or by user input?
 * get it to work with touch
 * add default name when saving: "Saved word search #1"?
 * cTable isn't always correct
 * Add more characters?
 * clear highlighting button?
 * don't ask to save if they haven't higlighted anything
 */

'use strict';

// localStorage.clear();
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MIN_LETTER_EXTENSION = 'ÉÜÍÖŒØÄÆÇÑÞÐ';
const MID_LETTER_EXTENSION = 'ÉŸÜÚÏÍÖÓŒØÁÄÆŚŁÇĆÑÞÐʃ';
const MAX_LETTER_EXTENSION = 'ÈÉÊËĒĖĘŸÛÜÙÚŪÎÏÍĪĮÌÔÖÒÓŒØŌÕÀÁÂÄÆÃÅĀSSŚŠŁŽŹŻÇĆČÑŃÞÐʃȜǷ';
const charSetMap = {
  modernEnglish: LETTERS,
  minExtended: LETTERS + LETTERS + MIN_LETTER_EXTENSION,
  maxExtended: LETTERS + LETTERS + MAX_LETTER_EXTENSION,
}
let useLetters = LETTERS;

let width = 45; // 45 max width for HP
let height = 19;

let cTable; // current table index

const wordsearch = document.getElementById('wordsearch');
const cellID = wordsearch.getElementsByTagName('td');
const saveTable = document.getElementById('savetable');
const saved = document.getElementById('saved');
const deleteAll = document.getElementById('deleteall');
const savedpopup = document.getElementById('savedpopup');
const popups = document.getElementById('popups');
const savedTables = document.getElementById('savedTables');

const newTable = document.getElementById('newtable');
const charSetSelect = document.getElementById('charSetSelect');
const customCharSet = document.getElementById('customCharSet');

const copyMenu = document.getElementById('copyMenu');
const copyBtn = document.getElementById('copyBtn');
const copyBackwardsBtn = document.getElementById('copyBackwardsBtn');
const pickHighlightColorBtn = document.getElementById('pickHighlightColorBtn');

const savepopup = document.getElementById('savepopup');
const givename = document.getElementById('givename');
const reallySave = document.getElementById('reallysave');

const saveAlert = document.getElementById('saveAlert');

const infoModal = document.getElementById('infoModal');

const backbtn = document.getElementById('backbtn');
const savedName = document.getElementById('savedName');
const seeName = document.getElementById('seeName');

const shadow = document.getElementById('shadow');

const isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);

let allTables; // All the saved tables
let shown; // Index of the currently displayed table
let tableName; // 
let savedyet; // Whether the newest table is saved yet or not
let lightmode; // Light/dark mode

// For clicks on each letter - now with colors!
let copyCellColor; // For copying cells by color and highlighting in a chosen color
let highlighting; // Highlighting or erasing
let newHighlightColor; // The color for highlighting

let startX;
let startY;
let endX;
let endY;
let pressMoved;

// Get things from storage and add event listeners
window.addEventListener('load', () => {
  allTables = gotchem('savedTables', []); // all the saved tables
  shown = gotchem('shown', null, sessionStorage); // showing a saved table or not
  tableName = gotchem('tableName', null, sessionStorage); // table name for shown
  savedyet = gotchem('savedyet', false); // newest table saved yet or not
  lightmode = gotchem('mode', true); // light or dark mode

  switchMode(true);
  draw();

  // Add these event listeners here because the functions are in a separate file
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

  pickHighlightColorBtn.addEventListener('click', () => {
    newHighlightColor = copyCellColor;
    resetCopyMenu();
  }, false);
}, false);

// Open copy menu on right click
wordsearch.addEventListener('contextmenu', e => {
  if (!e.target.matches('td')) { // Only copy if you right click on a cell
    return;
  }
  e.preventDefault();
  showCopyMenu(e.clientX, e.clientY, e.target);
}, false);

// Save tables before page unload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('savedTables', JSON.stringify(allTables));
}, false);

// Open the new word search modal
newTable.addEventListener('click', () => {
  showModal('newWordsearchModal');
}, false);

document.getElementById('createNewWordSearchBtn').addEventListener('click', () => {
  if (charSetSelect.value !== 'custom' || document.getElementById('customCharSetInput').value !== '') {
    createNewTable(charSetSelect.value);
  }
}, false);

charSetSelect.addEventListener('input', () => {
  if (charSetSelect.value === 'custom') {
    customCharSet.classList.remove('none');
  }
  else {
    customCharSet.classList.add('none');
  }
}, false);

// open the save table popup
saveTable.addEventListener('click', () => {
  showModal(savepopup);
  givename.focus();
}, false);

document.getElementById('infoBtn').addEventListener('click', () => {
  showModal(infoModal);
}, false);

// open the list of saved tables, and add links to all of them
saved.addEventListener('click', () => {
  allTables = gotchem('savedTables', []);
  for (let i = 0; i < allTables.length; i++) {
    allTables[i].number = i + 1;
  }
  showModal(savedpopup);

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
    resetCopyMenu();
  }
  else if (e.key === 'Enter' && !savepopup.classList.contains('none')) {
    saveTheTable();
  }
}, false);

// light/dark mode
document.getElementById('darkModeBtn').addEventListener('click', () => {
  switchMode();
  lightmode = lightmode ? false : true;
  localStorage.setItem('mode', JSON.stringify(lightmode));
}, false);

// Close modals on click outside and close copy menu
document.addEventListener('mousedown', e => {
  // Reset the copy menu if you do anything else
  resetCopyMenu(e);
  // Close modals if you click outside them
  if (e.target.matches('.closeBtn') || !e.target.closest('.popup')) {
    closeAll();
  }
}, false);

//go back to main word search from saved one
backbtn.addEventListener('click', () => {
  changeName(); //in case name was changed
  backbtn.classList.add('none');
  newTable.classList.remove('none');
  seeName.classList.add('none');
  saveTable.classList.remove('none');
  document.title = 'Random Word Search';
  shown = null;
  sessionStorage.setItem('shown', JSON.stringify(shown));
  draw();
}, false);