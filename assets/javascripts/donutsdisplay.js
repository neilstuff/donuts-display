var DataView = require('./view/table/dataview.js');
var TableModel = require('./view/table/tablemodel.js');
var SyncTableModel = require('./view/table/synctablemodel.js');
var TableView = require('./view/table/tableview.js');
var TablePainter = require('./view/table/tablepainter.js');
var FileUtil = require('./util/fileutil.js');
var Papa = require('papaparse/papaparse.min.js');

class DonutsDisplay {
    static isNumeric(obj) {
        var realStringObj = obj && obj.toString();

        return !Array.isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;

    }

    constructor() {
        this.splitter = undefined;
        this.bigTable = undefined;

        this.xOffset = 20;
        this.yOffset = 16;

        this.rows = [];
        this.types = {};
        this.columns = null;
        this.detailsTableHeight = 0;
        this.tableView = null;

    }

    resize() { }

    display(row) {
        var position = parseInt(row) + 1;

        var html = `<div style="margin: 0 auto; margin-top: 6px; text-align:left; overflow:hidden;">` +
            `<label style="color:navy; font-size:12px; height:16px; width:30px; line-height:36px; margin-left:5px; ">Row: ${position}</label></div>`;

        html += `<div style="position:absolute; margin-top:5px; left:0px; right:0px; height:1px; background-color:rgba(0,0,0,0.2); overflow:hidden;"></div>`;

        html += `<div style="position:absolute; margin-top:10px; left:0px; right:0px; top:50px; bottom:0px; style="overflow:hidden;">` +
            `<label style="width:100%; line-height:20px; font-size:12px; text-overflow: ellipsis; color:navy; white-space:nowrap; overflow:hidden; margin-left:5px;` +
            `display:inline-block;">` +
            `Values</label>` +
            `<div id="details-container" class="container" style="overflow-y: auto; overflow-x: auto; position:absolute; width:100%; bottom:5px; top:25px; ">` +
            `<table id="details-table" style="margin-left:10px;">`;

        for (var iColumn = 0; iColumn < this.columns.length; iColumn++) {
            html += `<tr><td><label style="width:100px; text-overflow: ellipsis; color:navy; white-space:nowrap; overflow:hidden; display:inline-block;">` +
                `${this.columns[iColumn]}</label></td><td>${this.rows[row][iColumn]}</td></tr>`;
        }

        html += `</table></div></div>`;

        document.getElementById('details').innerHTML = html;

        return false;

    }

    timeout(reader) {
        let results = Papa.parse(reader.result);
        let lines = results.data;
        
        this.rows = [];
        this.types = {};
        this.columns = null;

        loop: for (var line in lines) {

            if (!this.columns) {
                this.columns = lines[line];
            } else {

                for (var iColumn = 0; iColumn < lines[line].length; iColumn++) {

                    if (!(this.columns[iColumn] in this.types)) {
                        this.types[this.columns[iColumn]] = 'numeric';
                    }

                    if (((lines[line][iColumn]) != '') && (DonutsDisplay.isNumeric(lines[line][iColumn]))) {
                        this.types[this.columns[iColumn]] = 'string';
                    }

                }

                if (lines[line].length == this.columns.length) {
                    this.rows.push(lines[line]);
                }

            }

        }

        document.getElementById('details').innerHTML = "";

        let widths = [];

        for (var iColumn in this.columns) {

            widths.push(300);

        }

        let node = document.getElementById('table');
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }

        let dataview = new DataView(this.columns, this.rows);
        let painter = new TablePainter();

        this.tableView = new TableView({
            "container": "#table",
            "model": dataview,
            "nbRows": dataview.Length,
            "rowHeight": 20,
            "headerHeight": 20,
            "painter": painter,
            "columnWidths": widths
        });

        this.tableView.addProcessor(function (row) {
            this.display(row);
        }.bind(this));

        document.getElementById('table').style.display = "inline-block";

        let timeout = (function () {
            document.getElementById('waitDialog').style.display = "none";
            this.tableView.setup();
            this.tableView.resize();
        }.bind(this));
        
        window.setTimeout(timeout, 10);

    }

    open() {
        let fileutil = new FileUtil(document);
        let __this = this;

        fileutil.load((files) => {
            Array.prototype.slice.call(files).forEach((file) => {
                let reader = new FileReader();

                reader.onload = (e) => {

                    document.getElementById('waitDialog').style.display = "inline-block";
                    document.getElementById('placeholder').style.display = "none";

                    window.setTimeout(__this.timeout.bind(__this), 100, reader);

                }

                reader.readAsText(file);

            });

        });

    }

    /**
     * Respond to the Document 'ready' event
     */
    onload() {

        window.addEventListener('resize', (e) => { });

        document.getElementById('upload').addEventListener('click', (e) => {

            this.open();

            return false;

        });

        document.getElementById('open').addEventListener('click', (e) => {

            this.open();

            return false;

        });

        document.getElementById('window-minimize').addEventListener('click', (e) => {

            window.api.minimize();

        });

        document.getElementById('window-maximize').addEventListener('click', (e) => {
            var isMaximized = window.api.isMaximized();

            if (!isMaximized) {
                document.getElementById('window-maximize').classList.add("fa-window-restore");
                document.getElementById('window-maximize').classList.remove("fa-square");
                window.api.maximize();
            } else {
                document.getElementById('window-maximize').classList.remove("fa-window-restore");
                document.getElementById('window-maximize').classList.add("fa-square");
                window.api.unmaximize();
            }

        });

        document.getElementById('quit').addEventListener('click', (e) => {

            window.api.quit();

        });

    }

}

module.exports = DonutsDisplay;