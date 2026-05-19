class TableModel {

    hasCell(i, j) {

        return false;

    }

    getCell(i, j, callback) {

        callback("getCell not implemented");

    }

    getHeader(j, callback) {

        callback("getHeader not implemented");

    }

}

module.exports = TableModel;