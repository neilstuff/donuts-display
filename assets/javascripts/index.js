var DonutsDisplay = require('./donutsdisplay.js');

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

(new DonutsDisplay()).onload();