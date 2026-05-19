class TablePainter {

    setupCell(cellDiv) { }

    setupHeader(headerDiv) { }

    cleanUpCell(cellDiv) { }

    cleanUpHeader(headerDiv) { }

    cleanUp(table) {

        for (let cell in table.cells) {
            this.cleanUpCell(cell)
        }

        for (let header in table.columns) {
            this.cleanUpHeader(header);
        }

    }

    fillHeader(headerDiv, data, column) {

        headerDiv.getElementsByTagName('div')[0].textContent = data;
        headerDiv.getElementsByTagName('div')[0].parentElement.parentElement.style.borderLeft =
            column == 0 ? "1px solid rgb(0,0,0,0.0)" : "1px solid rgb(0,0,0,0.3)";

    }

    fillCell(cellDiv, data) {
        cellDiv.textContent = data;
    }

}

module.exports = TablePainter;