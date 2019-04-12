let cellinfo = [];
let cells = [];//for cells
let temptable = [];//for letters
let alltables = [];
let shown;

let width = 45;
let height = 19;

let seewordsearch = document.getElementById("seewordsearch");
let seesearchnum = document.getElementById("seesearchnum");
let backbtn = document.getElementById("backbtn");

function drawtable(table) {
  for (let i = 0; i < height; i++) {
      let row = table.insertRow(0);
      for(let j = 0; j < width; j++) {
          let cell = row.insertCell(0);
          cell.id = JSON.stringify(i) + JSON.stringify(j);
          cells.push(cell);
      }
  }
}

function draw() {
  let getshown = localStorage.getItem("shown");
  if (getshown !== null) {
    shown = JSON.parse(getshown)-1;
  }
  drawtable(seewordsearch);
  let getTableFromAll = localStorage.getItem("saved");
  if (getTableFromAll !== null) {
    alltables = JSON.parse(getTableFromAll);
    seesearchnum.textContent = "Search #" + (shown+1) +" - " + alltables[shown].name;
    document.title = "Search #" + (shown+1) + " - RWS";
    console.log(alltables);
    for (let i = 0; i < width*height; i++) {
      cells[i].textContent = alltables[shown].table[i];
      if (alltables[shown].highlit[i]) {
        cells[width*height-i-1].style.backgroundColor = alltables[shown].highlit[i];
      }
      else if (!alltables[shown].highlit[i]) {
        cells[width*height-i-1].style.backgroundColor = "transparent";
      }
    }
  }
}

draw();

function allclicks() {
  let downmouse, highlighting, getcolor;
  let makolor = [];
  let cellID = seewordsearch.getElementsByTagName('td');
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
          if (alltables[shown].highlit[i] !== getcolor) {highlighting = true;}
          if (alltables[shown].highlit[i]) {highlighting = false};
          downmouse = true;
          if (!alltables[shown].highlit[i]) {
              alltables[shown].highlit[i] = getcolor;
              cellID[i].style.backgroundColor = getcolor;
          }
          else if (alltables[shown].highlit[i]) {
              alltables[shown].highlit[i] = false;
              cellID[i].style.backgroundColor = "transparent";
          }
      }
      cellID[i].onmouseover = function() {
          if (downmouse) {
              if (alltables[shown].highlit[i] !== getcolor && highlighting) {
                  alltables[shown].highlit[i] = getcolor;
                  cellID[i].style.backgroundColor = getcolor;
              }
              else if (alltables[shown].highlit[i] !== getcolor && !highlighting) {
                  alltables[shown].highlit[i] = false;
                  cellID[i].style.backgroundColor = "transparent";
              }
          }
      }
  }
  seewordsearch.onmouseup = function() {
    downmouse = false;
    let selected = window.getSelection();
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      selected.modify();
    }
    localStorage.setItem("saved", JSON.stringify(alltables));
  }
}
allclicks();

backbtn.addEventListener("click", function() {
  window.close();
}, false);
