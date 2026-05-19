var TableModel = require('./tablemodel.js');

class SyncTableModel extends TableModel {

    getCellSync(i, j) {

        return `[${i}],[${j}]`;

    }

    getHeaderSync(j) {

        return `col [${j}]`;

    }

    hasCell(i, j) {

        return true;

    }

    hasHeader(j) {

        return true;

    }

    getCell(i, j, callback) {

        callback(this.getCellSync(i, j));

    }

    getHeader(j, callback) {

        callback(this.getHeaderSync(j));

    }

}

module.exports = SyncTableModel;