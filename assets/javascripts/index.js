var DonutsDisplay = require('./donutsdisplay.js');

import '../css/modal.css';
import '../css/tableview.css'
import '../css/tableview.css'
import '../css/scrollbar.css'
import '../css/toolbar.css'
import '../../node_modules/@fortawesome/fontawesome-free/css/all.css'

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

(new DonutsDisplay()).onload();