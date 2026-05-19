class FileUtil {

    constructor(document) {
        this._document = document;

    }

    saveAs(data, fileName) {
        var saveLink = this._document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        var canUseSaveLink = "download" in saveLink;
        var getURL = function () {
            return view.URL || view.webkitURL || view;
        }

        var click = function (node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }

        var fileURL = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));

        saveLink.href = fileURL;
        saveLink.download = fileName;

        click(saveLink);

    }

    load(callback) {
        var loadButton = this._document.createElementNS("http://www.w3.org/1999/xhtml", "input");

        loadButton.setAttribute("type", "file");

        loadButton.addEventListener('change', function (e) {
            var files = e.target.files

            callback(files);

            return false;

        }, false);

        loadButton.click();

    }

}

module.exports = FileUtil;