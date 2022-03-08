'use strict'

var splitter = undefined;
var bigTable = undefined;

var xOffset = 20;
var yOffset = 16;

var rows = [];
var types = {};
var columns = null;
var detailsTableHeight = 0;
var tableView = null;

class DataView extends SyncTableModel {

    constructor(columns, data) {
        super();

        this.__columns = columns;
        this.__data = data;
        this.__records = data.length;
    }

    get Length() {
        return this.__records;
    }

    getCellSync(i, j, cb) {

        return this.__data[i][j];

    }

    getHeaderSync(j) {

        return this.__columns[j];

    };

    hasCell(i, j) {

        return i < this.__data.length && j < this.__columns.length;

    }

}

function resize() {}

$.fn.Display = (row) => {
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

    for (var iColumn = 0; iColumn < columns.length; iColumn++) {
        html += `<tr><td><label style="width:100px; text-overflow: ellipsis; color:navy; white-space:nowrap; overflow:hidden; display:inline-block;">` +
            `${columns[iColumn]}</label></td><td>${rows[row][iColumn]}</td></tr>`;
    }

    html += `</table></div></div>`;

    $("#details").html(html);

    return false;

}

$.fn.IsNumeric = (obj) => {
    var realStringObj = obj && obj.toString();

    return !Array.isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;

}

$.fn.Open = () => {
         
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());

    let fileutil = new FileUtil(document);

    fileutil.load((files) => {
        Array.prototype.slice.call(files).forEach((file) => {
            let reader = new FileReader();

            reader.onload = (e) => {
                    $('#waitDialog').css('display', 'inline-block');
                    $('#placeholder').css('display', 'none');
 
                    window.setTimeout(function() {
                        let results = Papa.parse(reader.result);
                        let lines = results.data;
                        rows = [];
                        types = {};
                        columns = null;
                        loop: for (var line in lines) {

                            if (!columns) {
                                columns = lines[line];
                            } else {

                                for (var iColumn = 0; iColumn < lines[line].length; iColumn++) {

                                    if (!(columns[iColumn] in types)) {
                                        types[columns[iColumn]] = 'numeric';
                                    }

                                    if (((lines[line][iColumn]) != '') && (!$(this).IsNumeric(lines[line][iColumn]))) {
                                        types[columns[iColumn]] = 'string';
                                    }

                                }

                                if (lines[line].length == columns.length) {
                                    rows.push(lines[line]);
                                }

                            }

                        }

                        $("#details").html("");

                        let widths = [];

                        for (var iColumn in columns) {

                            widths.push(300);

                        }

                        let node = document.getElementById('table');
                        while (node.hasChildNodes()) {
                            node.removeChild(node.lastChild);
                        }

                        let dataview = new DataView(columns, rows);
                        let painter = new Painter();

                        tableView = new TableView({
                            "container": "#table",
                            "model": dataview,
                            "nbRows": dataview.Length,
                            "rowHeight": 20,
                            "headerHeight": 20,
                            "painter": painter,
                            "columnWidths": widths
                        });

                        tableView.addProcessor(function(row) {
                            $(this).Display(row);
                        })

                        $('#table').css('display', 'inline-block');

                        window.setTimeout(function() {
                            $('#waitDialog').css('display', 'none');
                            tableView.setup();
                            tableView.resize();
                        }, 10);

                    }, 100);

                },

                reader.readAsText(file);

        });

    });

}

/**
 * Respond to the Document 'ready' event
 */
 window.onload = function() {

    $(window).on('resize', (evt) => {});

    $('#upload').on('click', (e) => {

        $(this).Open();

        return false;

    });

    $('#open').on('click', (e) => {

        $(this).Open();

        return false;

    });

    $("#window-minimize").on('click', async(e) => {

        window.api.minimize();

    });

    $("#window-maximize").on('click', async(e) => {
        var isMaximized = window.api.isMaximized();

        if (!isMaximized) {
            $("#window-maximize").addClass("fa-window-restore");
            $("#window-maximize").removeClass("fa-square");
            window.api.maximize();
        } else {
            $("#window-maximize").removeClass("fa-window-restore");
            $("#window-maximize").addClass("fa-square");
            window.api.unmaximize();
        }

    });

    $("#quit").on('click', async(e) => {

        window.api.quit();

    });

}