/** Update UI for viewing a saved table */
function ifSaved() { //If viewing saved table
  backbtn.classList.remove('none'); //show the back button
  newTable.classList.add('none'); //hide the new table button
  document.title = 'RWS - ' + tableName; //change the title
  savedName.value = allTables[shown].name; //put the name of the saved table
  seeName.classList.remove('none'); //show the name
  saveTable.classList.add('none'); //hide the save button
}

/** Change the name of a saved table */
function changeName() {
  if (shown !== null) {
    let getName = savedName.value;
    if (givename.value !== '') {
      allTables[shown].name = getName;
    }
    localStorage.setItem('all', JSON.stringify(allTables));

    showModal(saveAlert);
    window.setTimeout(closeAll, 400);
  }
}

/**
 * Get an item from local- or sessionStorage safely, and set it to the default if it doesn't exist
 * @param {String} item The storage key
 * @param {*} defalt The default value
 * @param {*} type 
 * @returns {*} The item from storage, if any. Otherwise returns the default.
 */
function gotchem(item, defalt, type = localStorage) {
  let getem = type.getItem(item);
  if (getem !== null && JSON.parse(getem) !== undefined) return JSON.parse(getem);
  return defalt;
}

function showModal(modal) {
  if (typeof modal === 'string') {
    modal = document.getElementById(modal);
  }
  modal.classList.remove('none');
  shadow.classList.add('openShadow');
}

/** Close all modals */
function closeAll() {
  savedpopup.classList.add('none');
  savepopup.classList.add('none');
  infoModal.classList.add('none');
  saveAlert.classList.add('none');
  document.getElementById('newWordsearchModal').classList.add('none');
  shadow.classList.remove('openShadow');
};

/**
 * Reset the copy menu (hide it and un-disable the buttons)
 * @param {*} e 
 */
function resetCopyMenu(e = false) {
  if (!e || !e.target.closest('menu')) {
    copyMenu.classList.add('none');
    copyBtn.disabled = false;
    copyBackwardsBtn.disabled = false;
    pickHighlightColorBtn.disabled = false;
  }
}

/**
 * Find a word by color
 * @param {'forwards'|'backwards'} direction The direction to find the word in
 * @returns {string} All the characters that are the color of copyCellColor, in the order specified
 */
function findWord(direction = 'forwards') {
  if (!copyCellColor) {
    return false;
  }
  let word = '';
  allTables[cTable].highlit.forEach((color, idx) => {
    if (color === copyCellColor) {
      word += allTables[cTable].table.charAt(width * height - idx - 1);
    }
  });
  if (direction === 'forwards') {
    return word[0] + word.slice(1).toLocaleLowerCase();
  }
  else if (direction === 'backwards') {
    const reverseWord = [...word].reverse().join('');
    return reverseWord[0] + reverseWord.slice(1).toLocaleLowerCase();
  }
}

/**
 * Copy a word by color to the clipboard
 * @param {'forwards'|'backwards'} direction The direction to copy the word in
 * @returns {void}
 */
function copyWord(direction = 'forwards') {
  const word = findWord(direction);
  if (!word) {
    return;
  }

  try {
    navigator.clipboard.writeText(word);
  }
  catch (e) {
    const wordInput = document.createElement('input');
    wordInput.value = word;
    wordInput.select();
    document.body.appendChild(wordInput);
    document.execCommand('copy');
    wordInput.remove();
  }
  finally {
    resetCopyMenu();
  }
}

/** Switch light/dark mode */
function switchMode(start = false) {
  lightmode === start ?
    document.documentElement.classList.remove('darkMode') :
    document.documentElement.classList.add('darkMode');
}

/** Draw a table and reset things */
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
  const cells = drawtable(wordsearch, idx);

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
    fillTable(cells);
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

// Actually display the table on the page
function drawtable(table, index) {
  wordsearch.innerHTML = '';
  const cells = [];
  for (let i = 0; i < /* alltables[index]. */height; i++) {
    let row = table.insertRow(0);
    for (let j = 0; j < /* alltables[index]. */width; j++) {
      let cell = row.insertCell(0);
      cells.push(cell);
    }
  }
  return cells;
}

/** Fill a table with random letters and push it to allTables */
function fillTable(cells) {

  // Generate all the random letters for the table and fill the cells
  let tableLetters = '';
  for (let i = 0; i < width * height; i++) {
    const randomLetter = useLetters[Math.floor(Math.random() * useLetters.length)]
    tableLetters += randomLetter;
    cells[i].textContent = randomLetter;
  }

  allTables.push({
    name: '',
    number: allTables.length + 1,
    table: tableLetters,
    highlit: Array.from(new Array(width * height), () => 0), // Array full of zeros
    width: width,
    height: height,
  });
  localStorage.setItem('savedTables', JSON.stringify(allTables));
}

function createNewTable(charSet) {
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

    if (savedyet) {
      savedyet = false;
    }
    else {
      // Remove last table
      allTables.splice(allTables.length - 1, 1);
    }

    localStorage.setItem('savedyet', savedyet);
    localStorage.setItem('savedTables', JSON.stringify(allTables));

    // Set the charset
    if (charSet === 'custom') {
      useLetters = '';

      const customCharSetData = new FormData(document.forms.customCharSet);
      if (customCharSetData.get('includeEnglish') === 'modernEnglish') {
        useLetters += LETTERS;
      }
      let customChars = customCharSetData.get('customCharacters').replace(/\s|\n/g, '');

      if (Boolean(customCharSetData.get('capitalize'))) {
        customChars = customChars.toLocaleUpperCase();
      }
      useLetters += customChars;
    }
    else {
      useLetters = charSetMap[charSet];
    }
    draw(true);
    closeAll();
  }
}

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

/** Set up for dragging (Highlighting or not, pick a color, add event listeners) */
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

  // Only generate a random color if it's not set manually
  !newHighlightColor && (newHighlightColor = `rgba(${randomColor().join()}, 0.5)`);

  highlighting = true; // Highlighting by default

  // Erase only if the cell is already highlighted a different color
  if (allTables[cTable].highlit[cellNum] && allTables[cTable].highlit[cellNum] !== newHighlightColor) {
    highlighting = false
  }

  if (highlighting) {
    allTables[cTable].highlit[cellNum] = newHighlightColor;
    cellID[cellNum].style.backgroundColor = newHighlightColor;
  }
  else { // Reset the cell if not highlighting
    allTables[cTable].highlit[cellNum] = false;
    cellID[cellNum].style.backgroundColor = 'transparent';
  }

  wordsearch.addEventListener(whichMove, whileDragging, false);
}

/** Do the actual highlighting while dragging */
function whileDragging(e) { // added while dragging, removed when not
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

/** Remove event listeners and save the table */
function endDrag(e) {
  let whichmove = e.type === 'mouseup' ? 'mousemove' : 'touchmove';
  wordsearch.removeEventListener(whichmove, whileDragging, false);
  localStorage.setItem('savedTables', JSON.stringify(allTables));
  newHighlightColor = null; // Reset highlight color so it can be set manually
}

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

    saveTable.textContent = 'Saved!';
    saveTable.disabled = true;
  }
}
