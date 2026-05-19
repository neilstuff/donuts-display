/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var DonutsDisplay = __webpack_require__(1);

	document.addEventListener('dragover', event => event.preventDefault());
	document.addEventListener('drop', event => event.preventDefault());

	(new DonutsDisplay()).onload();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(2);
	var TableModel = __webpack_require__(4);
	var SyncTableModel = __webpack_require__(3);
	var TableView = __webpack_require__(5);
	var TablePainter = __webpack_require__(6);
	var FileUtil = __webpack_require__(7);
	var Papa = __webpack_require__(8);

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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var SyncTableModel = __webpack_require__(3);

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

	module.exports = DataView;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var TableModel = __webpack_require__(4);

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

/***/ }),
/* 4 */
/***/ (function(module, exports) {

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var TableModel = __webpack_require__(4);
	var TablePainter = __webpack_require__(6);

	var prefixedTransformCssKey;

	class Condition {
	    constructor() {
	        this.callbacks = [];
	        this.result = false;
	        this.resolved = false;
	    }

	    then(cb) {

	        if (this.resolved) {
	            return cb(this.result);
	        } else {
	            return this.callbacks.push(cb);
	        }

	    };

	    resolve(result) {
	        var cb, len, n, ref, results;

	        this.resolved = true;
	        this.result = result;
	        ref = this.callbacks;

	        results = [];

	        for (n = 0, len = ref.length; n < len; n++) {

	            cb = ref[n];

	            results.push(cb(result));

	        }

	        return results;

	    }

	}

	var domReadyPromise = new Condition();

	var getTranformPrefix = function () {
	    var el, len, n, ref, testKey;

	    el = document.createElement("div");

	    ref = ["transform", "WebkitTransform", "MozTransform", "OTransform", "MsTransform"];

	    for (n = 0, len = ref.length; n < len; n++) {
	        testKey = ref[n];

	        if (el.style[testKey] !== void 0) {
	            return testKey;
	        }

	    }

	}

	prefixedTransformCssKey = getTranformPrefix();

	class LRUCache {

	    constructor(size = 100) {

	        this.__size = size;
	        this.__data = {};
	        this.__lru_keys = [];

	    }

	    has(k) {

	        return this.__data.hasOwnProperty(k);

	    }

	    /** 
	     * If key k is in the cache, 
	     * calls cb immediatly with  as arguments
	     *
	     * @param {*} k the Key
	     *
	     */
	    get(k) {

	        return this.__data[k];

	    }

	    /**
	     * Set a Key
	     * 
	     * @param {*} k the Key
	     * @param {*} v the Value
	     */
	    set(k, v) {
	        var idx = this.__lru_keys.indexOf(k)

	        if (idx >= 0) {
	            this.__lru_keys.splice(idx, 1);
	        }

	        this.__lru_keys.push(k);

	        if (this.__lru_keys.length >= this.__size) {
	            var key = this.__lru_keys.shift();
	            delete this.__data[key]
	        }

	        this.__data[k] = v;

	    }

	}

	class PagedAsyncTableModel extends TableModel {

	    constructor(cacheSize = 100) {
	        this.__pageCache = new LRUCache(cacheSize);
	        this.__headerPageCache = new LRUCache(cacheSize);

	        this.__fetchCallbacks = {};
	        this.__headerFetchCallbacks = {};

	    }

	    cellPageName(i, j) {
	        return "";
	    }

	    headerPageName(j) {
	        return "";
	    }

	    getHeader(column, callback) {
	        var pageName = this.headerPageName(column);

	        if (this.__headerPageCache.has(pageName)) {
	            return callback(this.__headerPageCache.get(pageName)(column));
	        } else if (this.__headerFetchCallbacks[pageName] != null) {
	            return this.__headerFetchCallbacks[pageName].push([column, callback]);
	        } else {
	            this.__headerFetchCallbacks[pageName] = [
	                [column, callback]
	            ];

	            return this.fetchHeaderPage(pageName, (function (__this) {

	                return function (page) {

	                    var cb, len, n, ref, ref1;

	                    __this.__headerPageCache.set(pageName, page);

	                    ref = __this.__headerFetchCallbacks[pageName];

	                    for (n = 0, len = ref.length; n < len; n++) {

	                        ref1 = ref[n], column = ref1[0], cb = ref1[1];

	                        cb(page(column));

	                    }

	                    return delete __this.__headerFetchCallbacks[pageName];

	                }

	            })(this));

	        }

	    }

	    hasCell(column, row) {
	        var pageName = this.cellPageName(column, row);

	        return this.__pageCache.has(pageName);

	    }

	    getCell(i, j, cb) {
	        let pageName = this.cellPageName(i, j);

	        if (this.pageCache.has(pageName)) {

	            return cb(this.__pageCache.get(pageName)(i, j));

	        } else if (this.__fetchCallbacks[pageName] != null) {

	            return this.__fetchCallbacks[pageName].push([i, j, cb]);

	        } else {

	            this.__fetchCallbacks[pageName] = [
	                [i, j, cb]
	            ];

	            return this.__fetchCellPage(pageName, (function (__this) {

	                return function (page) {

	                    let len, n, ref, ref1;

	                    __this.pageCache.set(pageName, page);

	                    ref = _this.fetchCallbacks[pageName];

	                    for (let n = 0, len = ref.length; n < len; n++) {

	                        ref1 = ref[n], i = ref1[0], j = ref1[1], cb = ref1[2];
	                        cb(page(i, j));

	                    }

	                    return delete __this.fetchCallbacks[pageName];

	                };

	            })(this));

	        }

	    }

	    fetchCellPage(pageName, cb) { }

	}

	class EventRegister {

	    constructor() {

	        this.boundEvents = [];

	    }

	    bind(target, event, cb) {
	        this.boundEvents.push([target, event, cb]);
	        return target.addEventListener(event, cb);
	    }

	    unbindAll() {
	        let cb, event, len, n, ref1, target;

	        let ref = this.boundEvents;

	        for (n = 0, len = ref.length; n < len; n++) {
	            ref1 = ref[n], target = ref1[0], event = ref1[1], cb = ref1[2];
	            target.removeEventListener(event, cb);
	        }

	        return this.boundEvents = [];

	    }

	}

	class ScrollBarProxy {

	    constructor(container, headerContainer, width, height, eventRegister, visible, enableDragMove) {
	        let bigContentHorizontal, bigContentVertical, getDelta, onMouseWheel, onMouseWheelHeader, supportedEvent;

	        this.container = container;
	        this.headerContainer = headerContainer;
	        this.width = width;
	        this.height = height;
	        this.visible = visible != null ? visible : true;

	        this.enableDragMove = enableDragMove != null ? enableDragMove : true;
	        this.verticalScrollbar = document.createElement("div");
	        this.verticalScrollbar.className += " fattable-v-scrollbar";
	        this.horizontalScrollbar = document.createElement("div");
	        this.horizontalScrollbar.className += " fattable-h-scrollbar";

	        if (this.visible) {
	            this.container.appendChild(this.verticalScrollbar);
	            this.container.appendChild(this.horizontalScrollbar);
	        }

	        bigContentHorizontal = document.createElement("div");
	        bigContentHorizontal.style.height = 1 + "px";
	        bigContentHorizontal.style.width = this.width + "px";
	        bigContentVertical = document.createElement("div");
	        bigContentVertical.style.width = 1 + "px";
	        bigContentVertical.style.height = this.height + "px";

	        this.horizontalScrollbar.appendChild(bigContentHorizontal);
	        this.verticalScrollbar.appendChild(bigContentVertical);
	        this.scrollbarMargin = Math.max(this.horizontalScrollbar.offsetHeight, this.verticalScrollbar.offsetWidth);

	        this.verticalScrollbar.style.bottom = this.scrollbarMargin + "px";
	        this.horizontalScrollbar.style.right = this.scrollbarMargin + "px";

	        this.scrollLeft = 0;
	        this.scrollTop = 0;

	        this.horizontalScrollbar.onscroll = (function (__this) {

	            return function () {

	                if (!__this.dragging) {
	                    if (__this.scrollLeft !== __this.horizontalScrollbar.scrollLeft) {
	                        __this.scrollLeft = __this.horizontalScrollbar.scrollLeft;

	                        if (__this.onScroll != null) {
	                            return __this.onScroll(__this.scrollLeft, __this.scrollTop);
	                        } else {
	                            return;
	                        }
	                    }

	                }

	            };

	        })(this);

	        this.verticalScrollbar.onscroll = (function (__this) {
	            return function () {

	                if (!__this.dragging) {
	                    if (__this.scrollTop !== __this.verticalScrollbar.scrollTop) {
	                        __this.scrollTop = __this.verticalScrollbar.scrollTop;

	                        return __this.onScroll(__this.scrollLeft, __this.scrollTop);

	                    }

	                }

	            };

	        })(this);

	        if (this.enableDragMove) {
	            eventRegister.bind(this.container, 'mousedown', (function (__this) {

	                return function (event) {
	                    if (event.button === 1) {
	                        __this.dragging = true;
	                        __this.container.className = "fattable-body-container fattable-moving";

	                        __this.dragging_dX = __this.scrollLeft + event.clientX;

	                        return __this.dragging_dY = __this.scrollTop + event.clientY;

	                    }

	                };

	            })(this));

	            eventRegister.bind(this.container, 'mouseup', (function (__this) {

	                return function (event) {
	                    __this.dragging = false;
	                    return __this.container.className = "fattable-body-container";
	                };

	            })(this));

	            eventRegister.bind(this.container, 'mousemove', (function (_this) {
	                return function (event) {
	                    let deferred = function () {

	                        let newX, newY;

	                        if (_this.dragging) {

	                            newX = -event.clientX + _this.dragging_dX;
	                            newY = -event.clientY + _this.dragging_dY;

	                            return _this.setScrollXY(newX, newY);

	                        }

	                    };

	                    return window.setTimeout(deferred, 0);

	                };

	            })(this));

	            eventRegister.bind(this.container, 'mouseout', (function (__this) {

	                return function (event) {

	                    if (__this.dragging) {
	                        if ((event.toElement == null) || (event.toElement.parentElement.parentElement !== __this.container)) {
	                            __this.container.className = "fattable-body-container";
	                            return __this.dragging = false;
	                        }
	                    }

	                };

	            })(this));

	            eventRegister.bind(this.headerContainer, 'mousedown', (function (__this) {

	                return function (event) {

	                    if (event.button === 1) {
	                        __this.headerDragging = true;
	                        __this.headerContainer.className = "fattable-header-container fattable-moving";

	                        return __this.dragging_dX = __this.scrollLeft + event.clientX;

	                    }

	                };

	            })(this));

	            eventRegister.bind(this.container, 'mouseup', (function (__this) {

	                return function (event) {
	                    let captureClick;

	                    if (event.button === 1) {
	                        __this.headerDragging = false;
	                        __this.headerContainer.className = "fattable-header-container";
	                        event.stopPropagation();

	                        captureClick = function (e) {
	                            e.stopPropagation();

	                            return __this.removeEventListener('click', captureClick, true);

	                        };

	                        return __this.container.addEventListener('click', captureClick, true);

	                    }

	                };

	            })(this));

	            eventRegister.bind(this.headerContainer, 'mousemove', (function (__this) {

	                return function (event) {
	                    let deferred = function () {
	                        var newX;

	                        if (__this.headerDragging) {
	                            newX = -event.clientX + __this.dragging_dX;

	                            return __this.setScrollXY(newX);

	                        }

	                    };

	                    return window.setTimeout(deferred, 0);

	                };

	            })(this));

	            eventRegister.bind(this.headerContainer, 'mouseout', (function (__this) {

	                return function (event) {

	                    if (__this.headerDragging) {

	                        if ((event.toElement == null) || (event.toElement.parentElement.parentElement !== __this.headerContainer)) {
	                            __this.headerContainer.className = "fattable-header-container";
	                        }

	                        return __this.headerDragging = false;

	                    }

	                };

	            })(this));

	        }

	        if (this.width > this.horizontalScrollbar.clientWidth) {
	            this.maxScrollHorizontal = this.width - this.horizontalScrollbar.clientWidth;
	        } else {
	            this.maxScrollHorizontal = 0;
	        }


	        if (this.height > this.verticalScrollbar.clientHeight) {
	            this.maxScrollVertical = this.height - this.verticalScrollbar.clientHeight;
	        } else {
	            this.maxScrollVertical = 0;
	        }

	        supportedEvent = "DOMMouseScroll";

	        if (this.container.onwheel !== void 0) {
	            supportedEvent = "wheel";
	        } else if (this.container.onmousewheel !== void 0) {
	            supportedEvent = "mousewheel";
	        }

	        getDelta = (function () {

	            switch (supportedEvent) {

	                case "wheel":

	                    return function (event) {
	                        let deltaX, deltaY, ref, ref1, ref2, ref3;

	                        switch (event.deltaMode) {

	                            case event.DOM_DELTA_LINE:
	                                deltaX = (ref = -50 * event.deltaX) != null ? ref : 0;
	                                deltaY = (ref1 = -50 * event.deltaY) != null ? ref1 : 0;

	                                break;

	                            case event.DOM_DELTA_PIXEL:
	                                deltaX = (ref2 = -1 * event.deltaX) != null ? ref2 : 0;
	                                deltaY = (ref3 = -1 * event.deltaY) != null ? ref3 : 0;

	                        }

	                        return [deltaX, deltaY];

	                    };

	                case "mousewheel":

	                    return function (event) {
	                        let ref, ref1;
	                        let deltaX = 0;
	                        let deltaY = 0;

	                        deltaX = (ref = event.wheelDeltaX) != null ? ref : 0;
	                        deltaY = (ref1 = event.wheelDeltaY) != null ? ref1 : event.wheelDelta;

	                        return [deltaX, deltaY];

	                    };

	                case "DOMMouseScroll":

	                    return function (event) {
	                        let deltaX = 0;
	                        let deltaY = 0;

	                        if (event.axis === event.HORIZONTAL_AXI) {
	                            deltaX = -50.0 * event.detail;
	                        } else {
	                            deltaY = -50.0 * event.detail;
	                        }

	                        return [deltaX, deltaY];

	                    };

	            }

	        })();

	        onMouseWheel = (function (__this) {

	            return function (event) {

	                var deltaX, deltaY, has_scrolled, ref;

	                ref = getDelta(event), deltaX = ref[0], deltaY = ref[1];

	                has_scrolled = __this.setScrollXY(__this.scrollLeft - deltaX, __this.scrollTop - deltaY);

	                if (has_scrolled) {

	                    return event.preventDefault();

	                }

	            };

	        })(this);

	        onMouseWheelHeader = (function (__this) {

	            return function (event) {

	                var _, deltaX, has_scrolled, ref;

	                ref = getDelta(event), deltaX = ref[0], _ = ref[1];
	                has_scrolled = __this.setScrollXY(__this.scrollLeft - deltaX, __this.scrollTop);

	                if (has_scrolled) {

	                    return event.preventDefault();

	                }

	            };

	        })(this);

	        eventRegister.bind(this.container, supportedEvent, onMouseWheel);
	        eventRegister.bind(this.headerContainer, supportedEvent, onMouseWheelHeader);

	    }

	    onScroll(x, y) {

	    };

	    setScrollXY(x, y) {
	        let hasScrolled;

	        hasScrolled = false;

	        if (x != null) {

	            x = TableView.bound(x, 0, this.maxScrollHorizontal);

	            if (this.scrollLeft !== x) {
	                hasScrolled = true;
	                this.scrollLeft = x;
	            }

	        } else {
	            x = this.scrollLeft;
	        }

	        if (y != null) {
	            y = TableView.bound(y, 0, this.maxScrollVertical);

	            if (this.scrollTop !== y) {

	                hasScrolled = true;
	                this.scrollTop = y;

	            }

	        } else {

	            y = this.scrollTop;

	        }

	        this.horizontalScrollbar.scrollLeft = x;
	        this.verticalScrollbar.scrollTop = y;
	        this.onScroll(x, y);

	        return hasScrolled;

	    }

	}

	class TableView {

	    static bound(x, m, M) {

	        if (x < m) {
	            return m;
	        } else if (x > M) {
	            return M;
	        } else {
	            return x;
	        }

	    }

	    static smallestDiffSubsequence(arr, w) {
	        let l = 1;

	        let start = 0;

	        while (start + l < arr.length) {
	            if (arr[start + l] - arr[start] > w) {
	                start += 1;

	            } else {
	                l += 1;
	            }

	        }

	        return l;

	    }

	    static binarySearch(arr, x) {
	        var a, b, m, v;

	        if (arr[0] > x) {
	            return 0;
	        } else {
	            a = 0;
	            b = arr.length;

	            while (a + 2 < b) {
	                m = (a + b) / 2 | 0;
	                v = arr[m];

	                if (v < x) {
	                    a = m;
	                } else if (v > x) {
	                    b = m;
	                } else {
	                    return m;
	                }
	            }
	            return a;
	        }

	    }

	    static cumsum(arr) {
	        var cs, len, n, s, x;

	        cs = [0.0];
	        s = 0.0;

	        for (n = 0, len = arr.length; n < len; n++) {
	            x = arr[n];
	            s += x;
	            cs.push(s);

	        }

	        return cs;

	    }

	    constructor(parameters) {
	        let container = parameters.container;

	        if (container == null) {
	            throw "container not specified.";
	        }

	        if (typeof container === "string") {
	            this.container = document.querySelector(container);
	        } else if (typeof container === "object") {
	            this.container = container;

	        } else {
	            throw "Container must be a string or a dom element.";
	        }

	        this.__processors = [];
	        this.current_column = -1;

	        this.readRequiredParameter(parameters, "painter", new TablePainter());
	        this.readRequiredParameter(parameters, "autoSetup", true);
	        this.readRequiredParameter(parameters, "model");
	        this.readRequiredParameter(parameters, "nbRows");
	        this.readRequiredParameter(parameters, "rowHeight");
	        this.readRequiredParameter(parameters, "columnWidths");
	        this.readRequiredParameter(parameters, "rowHeight");
	        this.readRequiredParameter(parameters, "headerHeight");
	        this.readRequiredParameter(parameters, "scrollBarVisible", true);
	        this.readRequiredParameter(parameters, "enableDragMove", true);
	        this.nbCols = this.columnWidths.length;

	        if ((" " + this.container.className + " ").search(/\sfattable\s/) === -1) {
	            this.container.className += " fattable";
	        }

	        this.height = this.rowHeight * this.nbRows;
	        this.columnOffset = TableView.cumsum(this.columnWidths);
	        this.width = this.columnOffset[this.columnOffset.length - 1];

	        this.columns = {};
	        this.cells = {};
	        this.currentColumn = null;

	        this.getContainerDimension();

	        this.eventRegister = new EventRegister();

	        this.eventRegister.bind(window, 'resize', (function (__this) {

	            return function (event) {

	                __this.resize();

	            };

	        })(this));

	        this.eventRegister.bind(document, 'mouseup', (function (__this) {

	            return function (event) {

	                __this.currentColumn = null;

	            };

	        })(this));

	        if (this.autoSetup) {

	            domReadyPromise.then((function (__this) {

	                return function () {

	                    return __this.setup();

	                };

	            })(this));

	        }

	    }

	    readRequiredParameter(parameters, k, default_value) {

	        if (parameters[k] == null) {

	            if (default_value === void 0) {
	                throw `Expected parameter <${k}>`;
	            } else {
	                return this[k] = default_value;
	            }

	        } else {
	            return this[k] = parameters[k];
	        }

	    };

	    getContainerDimension() {
	        this.w = this.container.offsetWidth;
	        this.h = this.container.offsetHeight - this.headerHeight;
	        this.nbColsVisible = Math.min(TableView.smallestDiffSubsequence(this.columnOffset, this.w) + 2, this.columnWidths.length);
	        this.nbRowsVisible = Math.min((this.h / this.rowHeight | 0) + 2, this.nbRows);

	    };

	    leftTopCornerFromXY(x, y) {

	        let i = TableView.bound(y / this.rowHeight | 0, 0, this.nbRows - this.nbRowsVisible);
	        let j = TableView.bound(TableView.binarySearch(this.columnOffset, x), 0, this.nbCols - this.nbColsVisible);

	        return [i, j];

	    };

	    cleanUp() {
	        var ref;

	        if ((ref = this.scroll) != null) {

	            ref.onScroll = null;

	        }

	        this.painter.cleanUp(this);
	        this.container.innerHTML = "";

	        this.bodyContainer = null;

	        return this.headerContainer = null;

	    };

	    setup() {
	        var iColumn, row, column, n, o, onScroll, p, ref, ref1, ref2, ref3, ref4, ref5;

	        this.cleanUp();
	        this.getContainerDimension();
	        this.columns = {};
	        this.cells = {};

	        this.container.innerHTML = "";
	        this.headerContainer = document.createElement("div");
	        this.headerContainer.className += " fattable-header-container";

	        this.headerContainer.style.height = this.headerHeight + "px";
	        this.headerViewport = document.createElement("div");
	        this.headerViewport.className = "fattable-viewport";
	        this.headerViewport.style.width = this.width + "px";
	        this.headerViewport.style.height = this.headerHeight + "px";

	        this.headerContainer.appendChild(this.headerViewport);

	        this.bodyContainer = document.createElement("div");
	        this.bodyContainer.className = "fattable-body-container";
	        this.bodyContainer.style.top = this.headerHeight + "px";

	        this.bodyViewport = document.createElement("div");
	        this.bodyViewport.className = "fattable-viewport";
	        this.bodyViewport.style.width = this.width + "px";

	        this.bodyViewport.style.height = this.height + "px";
	        let __self = this;

	        for (column = n = ref = this.nbColsVisible, ref1 = this.nbColsVisible * 2; n < ref1; column = n += 1) {

	            for (row = o = ref2 = this.nbRowsVisible, ref3 = this.nbRowsVisible * 2; o < ref3; row = o += 1) {
	                let element = document.createElement("div");

	                this.painter.setupCell(element);
	                element.pending = false;
	                element.style.height = this.rowHeight + "px";

	                element.style.textOverflow = "ellipsis";
	                element.style.whiteSpace = "nowrap"
	                element.style.overflow = "none";

	                this.bodyViewport.appendChild(element);
	                this.cells[`${row},${column}`] = element;

	                element.onmouseover = function (e) {
	                    var coordinates = /(\d*),(\d*)/.exec(element.getAttribute("id"));

	                    for (var iColumn = __self.firstVisibleColumn; iColumn < __self.firstVisibleColumn + __self.nbColsVisible; iColumn++) {
	                        __self.cells[`${coordinates[1]},${iColumn}`].style.backgroundColor = "rgba(0,0,0,0.1)";
	                    }


	                }

	                element.onmouseout = function (e) {
	                    var coordinates = /(\d*),(\d*)/.exec(element.getAttribute("id"));

	                    for (var iColumn = __self.firstVisibleColumn; iColumn < __self.firstVisibleColumn + __self.nbColsVisible; iColumn++) {
	                        __self.cells[`${coordinates[1]},${iColumn}`].style.backgroundColor = "white";
	                    }
	                }

	                element.onmousedown = function (e) {
	                    var coordinates = /(\d*),(\d*)/.exec(element.getAttribute("id"));

	                    for (let processor in __self.__processors) {

	                        __self.__processors[processor](coordinates[1]);

	                    }

	                }

	            }

	        }

	        for (iColumn = p = ref4 = this.nbColsVisible, ref5 = this.nbColsVisible * 2; p < ref5; iColumn = p += 1) {
	            var element = document.createElement("div");
	            var span = document.createElement("span");

	            element.style.borderLeft = "1px solid rgb(0,0,0,0.0)";
	            element.style.height = this.headerHeight + "px";
	            element.pending = false;

	            var text = document.createElement("div");

	            text.style.height = this.headerHeight + "px";
	            text.style.position = "absolute";
	            text.style.textOverflow = "ellipsis";
	            text.style.whiteSpace = "nowrap";
	            text.style.overflow = "hidden";
	            text.style.left = "2px";
	            text.style.top = "6px";

	            text.textContent = "";

	            span.appendChild(text);

	            var divider = document.createElement("div");

	            divider.style.width = "2px";
	            divider.style.height = this.headerHeight + "px";
	            divider.style.position = "absolute";
	            divider.style.right = "1px";
	            divider.style.cursor = "col-resize";
	            divider.id = `divider-${iColumn}`;

	            var eventRegister = new EventRegister();

	            eventRegister.bind(divider, 'mousedown', (function (params) {

	                return function (event) {
	                    params.owner.currentColumn = params.element;
	                };

	            })({
	                owner: this,
	                element: element,
	            }));

	            span.appendChild(divider);

	            this.painter.setupHeader(element);

	            element.id = `column-${iColumn}`;

	            this.columns[iColumn] = element;

	            element.appendChild(span);

	            this.headerViewport.appendChild(element);

	        }

	        this.firstVisibleRow = this.nbRowsVisible;
	        this.firstVisibleColumn = this.nbColsVisible;
	        this.display(0, 0);

	        this.container.appendChild(this.bodyContainer);
	        this.container.appendChild(this.headerContainer);
	        this.bodyContainer.appendChild(this.bodyViewport);

	        this.refreshAllContent();

	        this.scroll = new ScrollBarProxy(this.bodyContainer, this.headerContainer, this.width, this.height,
	            this.eventRegister, this.scrollBarVisible, this.enableDragMove);

	        onScroll = (function (__this) {

	            return function (x, y) {
	                var _, cell, col, ref6, ref7, cellRef;

	                ref6 = __this.leftTopCornerFromXY(x, y), row = ref6[0], column = ref6[1];

	                __this.display(row, column);

	                ref7 = __this.columns;

	                for (_ in ref7) {

	                    col = ref7[_];
	                    col.style[prefixedTransformCssKey] = "translate(" + (col.left - x) + "px, 0px)";

	                }

	                cellRef = __this.cells;

	                for (_ in cellRef) {
	                    cell = cellRef[_];
	                    cell.style[prefixedTransformCssKey] = "translate(" + (cell.left - x) + "px," + (cell.top - y) + "px)";

	                }

	                clearTimeout(__this.scrollEndTimer);
	                __this.scrollEndTimer = setTimeout(__this.refreshAllContent.bind(__this), 200);

	                return __this.onScroll(x, y);

	            };

	        })(this);

	        this.eventRegister.bind(document, 'mousemove', (function (__this) {

	            return function (event) {

	                if (__this.currentColumn != null) {
	                    var rect = __this.currentColumn.getBoundingClientRect();
	                    var width = event.pageX - Math.round(rect.left);
	                    var styleWidth = parseInt(__this.currentColumn.style.width.replace('px', ''));

	                    if (width < 10) {
	                        return;
	                    }

	                    var diff = width - styleWidth;

	                    var nextColumn = false;
	                    var left = __this.columns[__this.firstVisibleColumn].left;
	                    var columnPos = __this.firstVisibleColumn;
	                    var nextWidth = 0;
	                    var leftPosition = 0;
	                    var widths = [];

	                    for (var iColumn = __this.firstVisibleColumn; iColumn < __this.nbColsVisible + __this.firstVisibleColumn; iColumn += 1) {
	                        var nextRect = __this.columns[iColumn].getBoundingClientRect();

	                        if (nextColumn) {
	                            var columnWidth = parseInt(__this.columns[iColumn].style.width.replace('px', '')) - diff;

	                            if (columnWidth < 10) {
	                                return;
	                            }

	                            __this.currentColumn.style.width = `${width}px`;
	                            __this.columns[columnPos].style[prefixedTransformCssKey] = `translate(${(left - __this.scroll.scrollLeft)}px, 0px)`;

	                            __this.columns[columnPos].left = left;
	                            __this.columnOffset[columnPos] = left - diff;
	                            __this.columnWidths[columnPos] = columnWidth;
	                            __this.columns[columnPos].style.width = `${columnWidth}px`;

	                            leftPosition = left;
	                            left += columnWidth;

	                            widths.push(columnWidth);

	                            nextColumn = false;

	                        } else if (__this.columns[iColumn].id == __this.currentColumn.id) {
	                            __this.columnWidths[columnPos] = width;
	                            columnPos = iColumn;
	                            widths.push(width);

	                            left += width;

	                            nextColumn = true;
	                        } else {
	                            left += parseInt(__this.columns[iColumn].style.width.replace('px', ''));
	                        }

	                        columnPos = columnPos + 1;

	                    }

	                    nextColumn = false;

	                    for (var iRow = __this.firstVisibleRow; iRow < __this.nbRowsVisible + __this.firstVisibleRow; iRow += 1) {
	                        for (var iColumn = __this.firstVisibleColumn; iColumn < __this.nbColsVisible + __this.firstVisibleColumn; iColumn += 1) {
	                            var k = iRow + "," + iColumn;

	                            if (nextColumn) {
	                                __this.cells[k].style.width = `${widths[1]}px`;
	                                __this.cells[k].left = leftPosition;
	                                __this.cells[k].style[prefixedTransformCssKey] = `translate(${leftPosition - __this.scroll.scrollLeft}px, ${(iRow * __this.rowHeight) - __this.scroll.scrollTop}px)`;

	                                nextColumn = false;

	                            }

	                            if (__this.columns[iColumn].id == __this.currentColumn.id) {
	                                __this.cells[k].style.width = `${widths[0]}px`;
	                                nextColumn = true;
	                            }

	                        }

	                    }

	                }

	            };

	        })(this));

	        this.scroll.onScroll = onScroll;

	        return onScroll(0, 0);

	    }

	    resize() {
	        var last_i = this.firstVisibleRow;
	        var last_j = this.scroll.scrollLeft;

	        this.setup();

	        var targetY = this.rowHeight * last_i;

	        return this.scroll.setScrollXY(last_j, targetY);

	    }

	    refreshAllContent(evenNotPending) {
	        var cell, drawer, header, row, column, k, n, ref, ref1, results;

	        if (evenNotPending == null) {

	            evenNotPending = false;

	        }

	        drawer = (function (__this) {

	            return function (header, column) {

	                if (evenNotPending || header.pending) {

	                    return __this.model.getHeader(column, function (data) {

	                        header.pending = false;

	                        return __this.painter.fillHeader(header, data, column);

	                    });

	                }

	            };

	        })(this);

	        results = [];

	        for (column = n = ref = this.firstVisibleColumn, ref1 = this.firstVisibleColumn + this.nbColsVisible; n < ref1; column = n += 1) {

	            header = this.columns[column];

	            drawer(header, column);

	            results.push((function () {
	                var tracker, ref2, ref3, rows;

	                rows = [];

	                for (row = tracker = ref2 = this.firstVisibleRow, ref3 = this.firstVisibleRow + this.nbRowsVisible; tracker < ref3; row = tracker += 1) {

	                    k = row + "," + column;

	                    cell = this.cells[k];

	                    if (evenNotPending || cell.pending) {

	                        rows.push((function (__this) {

	                            return function (cell) {

	                                return __this.model.getCell(row, column, function (data) {

	                                    cell.pending = false;

	                                    return __this.painter.fillCell(cell, data);

	                                });

	                            };

	                        })(this)(cell));

	                    } else {

	                        rows.push(void 0);

	                    }

	                }

	                return rows;

	            }).call(this));

	        }

	        return results;

	    };

	    onScroll(x, y) { };

	    goTo(i, j) {
	        var targetX, targetY;

	        targetY = i != null ? this.rowHeight * i : void 0;
	        targetX = j != null ? this.columnOffset[j] : void 0;

	        return this.scroll.setScrollXY(targetX, targetY);

	    };

	    display(i, j) {

	        this.headerContainer.style.display = "none";
	        this.bodyContainer.style.display = "none";

	        this.moveX(j);
	        this.moveY(i);

	        this.headerContainer.style.display = "";
	        return this.bodyContainer.style.display = "";

	    };

	    moveX(j) {
	        var cell, col_width, col_x, column, dj, fn, header, i, k, last_i, last_j, n, o, offset_j, orig_j, ref, ref1, ref2, shift_j;

	        last_i = this.firstVisibleRow;
	        last_j = this.firstVisibleColumn;

	        shift_j = j - last_j;

	        if (shift_j === 0) {

	            return;

	        }

	        dj = Math.min(Math.abs(shift_j), this.nbColsVisible);

	        for (offset_j = n = 0, ref = dj; n < ref; offset_j = n += 1) {

	            if (shift_j > 0) {
	                orig_j = this.firstVisibleColumn + offset_j;
	                column = j + offset_j + this.nbColsVisible - dj;

	            } else {
	                orig_j = this.firstVisibleColumn + this.nbColsVisible - dj + offset_j;
	                column = j + offset_j;

	            }

	            col_x = this.columnOffset[column];

	            col_width = this.columnWidths[column] + "px";

	            header = this.columns[orig_j];

	            delete this.columns[orig_j];

	            if (this.model.hasHeader(column)) {

	                this.model.getHeader(column, (function (__this) {

	                    return function (data) {

	                        header.pending = false;

	                        return __this.painter.fillHeader(header, data, column);

	                    };

	                })(this));

	            }

	            header.left = col_x;

	            header.style.width = col_width;

	            this.columns[column] = header;

	            fn = (function (__this) {

	                return function (cell) {

	                    if (__this.model.hasCell(i, column)) {

	                        return __this.model.getCell(i, column, function (data) {

	                            cell.pending = false;

	                            return __this.painter.fillCell(cell, data);

	                        });

	                    }

	                };

	            })(this);

	            for (i = o = ref1 = last_i, ref2 = last_i + this.nbRowsVisible; o < ref2; i = o += 1) {

	                k = i + "," + orig_j;

	                cell = this.cells[k];
	                delete this.cells[k];

	                this.cells[i + "," + column] = cell;
	                cell.left = col_x;
	                cell.style.width = col_width;

	                fn(cell);

	            }

	        }

	        return this.firstVisibleColumn = j;

	    }

	    moveY(i) {
	        var cell, dest_i, di, fn, j, k, last_i, last_j, n, o, offset_i, orig_i, ref, ref1, ref2, row_y, shift_i;

	        last_i = this.firstVisibleRow;
	        last_j = this.firstVisibleColumn;

	        shift_i = i - last_i;

	        if (shift_i === 0) {

	            return;

	        }

	        di = Math.min(Math.abs(shift_i), this.nbRowsVisible);

	        for (offset_i = n = 0, ref = di; n < ref; offset_i = n += 1) {

	            if (shift_i > 0) {
	                orig_i = last_i + offset_i;
	                dest_i = i + offset_i + this.nbRowsVisible - di;

	            } else {
	                orig_i = last_i + this.nbRowsVisible - di + offset_i;
	                dest_i = i + offset_i;
	            }

	            row_y = dest_i * this.rowHeight;

	            fn = (function (__this) {

	                return function (cell) {
	                    cell.setAttribute("id", `${dest_i},${j}`);

	                    if (__this.model.hasCell(dest_i, j)) {

	                        return __this.model.getCell(dest_i, j, function (data) {

	                            cell.pending = false;

	                            return __this.painter.fillCell(cell, data);

	                        });

	                    }

	                };

	            })(this);

	            for (j = o = ref1 = last_j, ref2 = last_j + this.nbColsVisible; o < ref2; j = o += 1) {

	                k = orig_i + "," + j;

	                cell = this.cells[k];
	                delete this.cells[k];

	                this.cells[dest_i + "," + j] = cell;

	                cell.top = row_y;

	                fn(cell);

	            }

	        }

	        return this.firstVisibleRow = i;

	    }

	    get processors() {
	        return this.__processors;
	    }

	    set processors(processors) {
	        return this.__processors = processors;
	    }

	    addProcessor(processor) {
	        this.__processors.push(processor);
	    }

	}

	module.exports = TableView;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

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

/***/ }),
/* 7 */
/***/ (function(module, exports) {

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* @license
	Papa Parse
	v4.6.3
	https://github.com/mholt/PapaParse
	License: MIT
	*/
	Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),function(e,t){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof module&&"undefined"!=typeof exports?module.exports=t():e.Papa=t()}(this,function(){"use strict";var s,e,f="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==f?f:{},n=!f.document&&!!f.postMessage,o=n&&/(\?|&)papaworker(=|&|$)/.test(f.location.search),a=!1,h={},u=0,k={parse:function(e,t){var r=(t=t||{}).dynamicTyping||!1;z(r)&&(t.dynamicTypingFunction=r,r={});if(t.dynamicTyping=r,t.transform=!!z(t.transform)&&t.transform,t.worker&&k.WORKERS_SUPPORTED){var i=function(){if(!k.WORKERS_SUPPORTED)return!1;if(!a&&null===k.SCRIPT_PATH)throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");var e=k.SCRIPT_PATH||s;e+=(-1!==e.indexOf("?")?"&":"?")+"papaworker";var t=new f.Worker(e);return t.onmessage=m,t.id=u++,h[t.id]=t}();return i.userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=z(t.step),t.chunk=z(t.chunk),t.complete=z(t.complete),t.error=z(t.error),delete t.worker,void i.postMessage({input:e,config:t,workerId:i.id})}var n=null;k.NODE_STREAM_INPUT,"string"==typeof e?n=t.download?new c(t):new _(t):!0===e.readable&&z(e.read)&&z(e.on)?n=new g(t):(f.File&&e instanceof File||e instanceof Object)&&(n=new p(t));return n.stream(e)},unparse:function(e,t){var i=!1,g=!0,m=",",y="\r\n",n='"',r=!1;!function(){if("object"!=typeof t)return;"string"!=typeof t.delimiter||k.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter);("boolean"==typeof t.quotes||Array.isArray(t.quotes))&&(i=t.quotes);"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(r=t.skipEmptyLines);"string"==typeof t.newline&&(y=t.newline);"string"==typeof t.quoteChar&&(n=t.quoteChar);"boolean"==typeof t.header&&(g=t.header)}();var s=new RegExp(M(n),"g");"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return o(null,e,r);if("object"==typeof e[0])return o(a(e[0]),e,r)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:a(e.data[0])),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),o(e.fields||[],e.data||[],r);throw"exception: Unable to serialize unrecognized input";function a(e){if("object"!=typeof e)return[];var t=[];for(var r in e)t.push(r);return t}function o(e,t,r){var i="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var n=Array.isArray(e)&&0<e.length,s=!Array.isArray(t[0]);if(n&&g){for(var a=0;a<e.length;a++)0<a&&(i+=m),i+=v(e[a],a);0<t.length&&(i+=y)}for(var o=0;o<t.length;o++){var h=n?e.length:t[o].length,u=!1,f=n?0===Object.keys(t[o]).length:0===t[o].length;if(r&&!n&&(u="greedy"===r?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===r&&n){for(var d=[],l=0;l<h;l++){var c=s?e[l]:l;d.push(t[o][c])}u=""===d.join("").trim()}if(!u){for(var p=0;p<h;p++){0<p&&!f&&(i+=m);var _=n&&s?e[p]:p;i+=v(t[o][_],p)}o<t.length-1&&(!r||0<h&&!f)&&(i+=y)}}return i}function v(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);e=e.toString().replace(s,n+n);var r="boolean"==typeof i&&i||Array.isArray(i)&&i[t]||function(e,t){for(var r=0;r<t.length;r++)if(-1<e.indexOf(t[r]))return!0;return!1}(e,k.BAD_DELIMITERS)||-1<e.indexOf(m)||" "===e.charAt(0)||" "===e.charAt(e.length-1);return r?n+e+n:e}}};if(k.RECORD_SEP=String.fromCharCode(30),k.UNIT_SEP=String.fromCharCode(31),k.BYTE_ORDER_MARK="\ufeff",k.BAD_DELIMITERS=["\r","\n",'"',k.BYTE_ORDER_MARK],k.WORKERS_SUPPORTED=!n&&!!f.Worker,k.SCRIPT_PATH=null,k.NODE_STREAM_INPUT=1,k.LocalChunkSize=10485760,k.RemoteChunkSize=5242880,k.DefaultDelimiter=",",k.Parser=v,k.ParserHandle=r,k.NetworkStreamer=c,k.FileStreamer=p,k.StringStreamer=_,k.ReadableStreamStreamer=g,f.jQuery){var d=f.jQuery;d.fn.parse=function(o){var r=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&f.FileReader)||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},r)})}),e(),this;function e(){if(0!==h.length){var e,t,r,i,n=h[0];if(z(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,r=n.inputElem,i=s.reason,void(z(o.error)&&o.error({name:e},t,r,i));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config))}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){z(a)&&a(e,n.file,n.inputElem),u()},k.parse(n.file,n.instanceConfig)}else z(o.complete)&&o.complete()}function u(){h.splice(0,1),e()}}}function l(e){this._handle=null,this._finished=!1,this._completed=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=E(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new r(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&z(this._config.beforeFirstChunk)){var r=this._config.beforeFirstChunk(e);void 0!==r&&(e=r)}this.isFirstChunk=!1;var i=this._partialLine+e;this._partialLine="";var n=this._handle.parse(i,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var s=n.meta.cursor;this._finished||(this._partialLine=i.substring(s-this._baseIndex),this._baseIndex=s),n&&n.data&&(this._rowCount+=n.data.length);var a=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(o)f.postMessage({results:n,workerId:k.WORKER_ID,finished:a});else if(z(this._config.chunk)&&!t){if(this._config.chunk(n,this._handle),this._handle.paused()||this._handle.aborted())return;n=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(n.data),this._completeResults.errors=this._completeResults.errors.concat(n.errors),this._completeResults.meta=n.meta),this._completed||!a||!z(this._config.complete)||n&&n.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),a||n&&n.meta.paused||this._nextChunk(),n}},this._sendError=function(e){z(this._config.error)?this._config.error(e):o&&this._config.error&&f.postMessage({workerId:k.WORKER_ID,error:e,finished:!1})}}function c(e){var i;(e=e||{}).chunkSize||(e.chunkSize=k.RemoteChunkSize),l.call(this,e),this._nextChunk=n?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(i=new XMLHttpRequest,this._config.withCredentials&&(i.withCredentials=this._config.withCredentials),n||(i.onload=w(this._chunkLoaded,this),i.onerror=w(this._chunkError,this)),i.open("GET",this._input,!n),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var t in e)i.setRequestHeader(t,e[t])}if(this._config.chunkSize){var r=this._start+this._config.chunkSize-1;i.setRequestHeader("Range","bytes="+this._start+"-"+r),i.setRequestHeader("If-None-Match","webkit-no-cache")}try{i.send()}catch(e){this._chunkError(e.message)}n&&0===i.status?this._chunkError():this._start+=this._config.chunkSize}},this._chunkLoaded=function(){4===i.readyState&&(i.status<200||400<=i.status?this._chunkError():(this._finished=!this._config.chunkSize||this._start>function(e){var t=e.getResponseHeader("Content-Range");if(null===t)return-1;return parseInt(t.substr(t.lastIndexOf("/")+1))}(i),this.parseChunk(i.responseText)))},this._chunkError=function(e){var t=i.statusText||e;this._sendError(new Error(t))}}function p(e){var i,n;(e=e||{}).chunkSize||(e.chunkSize=k.LocalChunkSize),l.call(this,e);var s="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,n=e.slice||e.webkitSlice||e.mozSlice,s?((i=new FileReader).onload=w(this._chunkLoaded,this),i.onerror=w(this._chunkError,this)):i=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var t=Math.min(this._start+this._config.chunkSize,this._input.size);e=n.call(e,this._start,t)}var r=i.readAsText(e,this._config.encoding);s||this._chunkLoaded({target:{result:r}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(i.error)}}function _(e){var r;l.call(this,e=e||{}),this.stream=function(e){return r=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e=this._config.chunkSize,t=e?r.substr(0,e):r;return r=e?r.substr(e):"",this._finished=!r,this.parseChunk(t)}}}function g(e){l.call(this,e=e||{});var t=[],r=!0,i=!1;this.pause=function(){l.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){l.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){i&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):r=!0},this._streamData=w(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),r&&(r=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=w(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=w(function(){this._streamCleanUp(),i=!0,this._streamData("")},this),this._streamCleanUp=w(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function r(g){var a,o,h,i=/^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,n=/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,t=this,r=0,s=0,u=!1,e=!1,f=[],d={data:[],errors:[],meta:{}};if(z(g.step)){var l=g.step;g.step=function(e){if(d=e,p())c();else{if(c(),0===d.data.length)return;r+=e.data.length,g.preview&&r>g.preview?o.abort():l(d,t)}}}function m(e){return"greedy"===g.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function c(){if(d&&h&&(y("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+k.DefaultDelimiter+"'"),h=!1),g.skipEmptyLines)for(var e=0;e<d.data.length;e++)m(d.data[e])&&d.data.splice(e--,1);return p()&&function(){if(!d)return;for(var e=0;p()&&e<d.data.length;e++)for(var t=0;t<d.data[e].length;t++){var r=d.data[e][t];g.trimHeaders&&(r=r.trim()),f.push(r)}d.data.splice(0,1)}(),function(){if(!d||!g.header&&!g.dynamicTyping&&!g.transform)return d;for(var e=0;e<d.data.length;e++){var t,r=g.header?{}:[];for(t=0;t<d.data[e].length;t++){var i=t,n=d.data[e][t];g.header&&(i=t>=f.length?"__parsed_extra":f[t]),g.transform&&(n=g.transform(n,i)),n=_(i,n),"__parsed_extra"===i?(r[i]=r[i]||[],r[i].push(n)):r[i]=n}d.data[e]=r,g.header&&(t>f.length?y("FieldMismatch","TooManyFields","Too many fields: expected "+f.length+" fields but parsed "+t,s+e):t<f.length&&y("FieldMismatch","TooFewFields","Too few fields: expected "+f.length+" fields but parsed "+t,s+e))}g.header&&d.meta&&(d.meta.fields=f);return s+=d.data.length,d}()}function p(){return g.header&&0===f.length}function _(e,t){return r=e,g.dynamicTypingFunction&&void 0===g.dynamicTyping[r]&&(g.dynamicTyping[r]=g.dynamicTypingFunction(r)),!0===(g.dynamicTyping[r]||g.dynamicTyping)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&(i.test(t)?parseFloat(t):n.test(t)?new Date(t):""===t?null:t):t;var r}function y(e,t,r,i){d.errors.push({type:e,code:t,message:r,row:i})}this.parse=function(e,t,r){var i=g.quoteChar||'"';if(g.newline||(g.newline=function(e,t){e=e.substr(0,1048576);var r=new RegExp(M(t)+"([^]*?)"+M(t),"gm"),i=(e=e.replace(r,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<i[0].length;if(1===i.length||s)return"\n";for(var a=0,o=0;o<i.length;o++)"\n"===i[o][0]&&a++;return a>=i.length/2?"\r\n":"\r"}(e,i)),h=!1,g.delimiter)z(g.delimiter)&&(g.delimiter=g.delimiter(e),d.meta.delimiter=g.delimiter);else{var n=function(e,t,r,i){for(var n,s,a,o=[",","\t","|",";",k.RECORD_SEP,k.UNIT_SEP],h=0;h<o.length;h++){var u=o[h],f=0,d=0,l=0;a=void 0;for(var c=new v({comments:i,delimiter:u,newline:t,preview:10}).parse(e),p=0;p<c.data.length;p++)if(r&&m(c.data[p]))l++;else{var _=c.data[p].length;d+=_,void 0!==a?1<_&&(f+=Math.abs(_-a),a=_):a=0}0<c.data.length&&(d/=c.data.length-l),(void 0===s||s<f)&&1.99<d&&(s=f,n=u)}return{successful:!!(g.delimiter=n),bestDelimiter:n}}(e,g.newline,g.skipEmptyLines,g.comments);n.successful?g.delimiter=n.bestDelimiter:(h=!0,g.delimiter=k.DefaultDelimiter),d.meta.delimiter=g.delimiter}var s=E(g);return g.preview&&g.header&&s.preview++,a=e,o=new v(s),d=o.parse(a,t,r),c(),u?{meta:{paused:!0}}:d||{meta:{paused:!1}}},this.paused=function(){return u},this.pause=function(){u=!0,o.abort(),a=a.substr(o.getCharIndex())},this.resume=function(){u=!1,t.streamer.parseChunk(a,!0)},this.aborted=function(){return e},this.abort=function(){e=!0,o.abort(),d.meta.aborted=!0,z(g.complete)&&g.complete(d),a=""}}function M(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function v(e){var S,O=(e=e||{}).delimiter,x=e.newline,T=e.comments,I=e.step,A=e.preview,D=e.fastMode,L=S=void 0===e.quoteChar?'"':e.quoteChar;if(void 0!==e.escapeChar&&(L=e.escapeChar),("string"!=typeof O||-1<k.BAD_DELIMITERS.indexOf(O))&&(O=","),T===O)throw"Comment character same as delimiter";!0===T?T="#":("string"!=typeof T||-1<k.BAD_DELIMITERS.indexOf(T))&&(T=!1),"\n"!==x&&"\r"!==x&&"\r\n"!==x&&(x="\n");var P=0,F=!1;this.parse=function(i,t,r){if("string"!=typeof i)throw"Input must be a string";var n=i.length,e=O.length,s=x.length,a=T.length,o=z(I),h=[],u=[],f=[],d=P=0;if(!i)return C();if(D||!1!==D&&-1===i.indexOf(S)){for(var l=i.split(x),c=0;c<l.length;c++){if(f=l[c],P+=f.length,c!==l.length-1)P+=x.length;else if(r)return C();if(!T||f.substr(0,a)!==T){if(o){if(h=[],k(f.split(O)),R(),F)return C()}else k(f.split(O));if(A&&A<=c)return h=h.slice(0,A),C(!0)}}return C()}for(var p,_=i.indexOf(O,P),g=i.indexOf(x,P),m=new RegExp(M(L)+M(S),"g");;)if(i[P]!==S)if(T&&0===f.length&&i.substr(P,a)===T){if(-1===g)return C();P=g+s,g=i.indexOf(x,P),_=i.indexOf(O,P)}else if(-1!==_&&(_<g||-1===g))f.push(i.substring(P,_)),P=_+e,_=i.indexOf(O,P);else{if(-1===g)break;if(f.push(i.substring(P,g)),w(g+s),o&&(R(),F))return C();if(A&&h.length>=A)return C(!0)}else for(p=P,P++;;){if(-1===(p=i.indexOf(S,p+1)))return r||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:P}),E();if(p===n-1)return E(i.substring(P,p).replace(m,S));if(S!==L||i[p+1]!==L){if(S===L||0===p||i[p-1]!==L){var y=b(-1===g?_:Math.min(_,g));if(i[p+1+y]===O){f.push(i.substring(P,p).replace(m,S)),P=p+1+y+e,_=i.indexOf(O,P),g=i.indexOf(x,P);break}var v=b(g);if(i.substr(p+1+v,s)===x){if(f.push(i.substring(P,p).replace(m,S)),w(p+1+v+s),_=i.indexOf(O,P),o&&(R(),F))return C();if(A&&h.length>=A)return C(!0);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:P}),p++}}else p++}return E();function k(e){h.push(e),d=P}function b(e){var t=0;if(-1!==e){var r=i.substring(p+1,e);r&&""===r.trim()&&(t=r.length)}return t}function E(e){return r||(void 0===e&&(e=i.substr(P)),f.push(e),P=n,k(f),o&&R()),C()}function w(e){P=e,k(f),f=[],g=i.indexOf(x,P)}function C(e){return{data:h,errors:u,meta:{delimiter:O,linebreak:x,aborted:F,truncated:!!e,cursor:d+(t||0)}}}function R(){I(C()),h=[],u=[]}},this.abort=function(){F=!0},this.getCharIndex=function(){return P}}function m(e){var t=e.data,r=h[t.workerId],i=!1;if(t.error)r.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){i=!0,y(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:b,resume:b};if(z(r.userStep)){for(var s=0;s<t.results.data.length&&(r.userStep({data:[t.results.data[s]],errors:t.results.errors,meta:t.results.meta},n),!i);s++);delete t.results}else z(r.userChunk)&&(r.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!i&&y(t.workerId,t.results)}function y(e,t){var r=h[e];z(r.userComplete)&&r.userComplete(t),r.terminate(),delete h[e]}function b(){throw"Not implemented."}function E(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var r in e)t[r]=E(e[r]);return t}function w(e,t){return function(){e.apply(t,arguments)}}function z(e){return"function"==typeof e}return o?f.onmessage=function(e){var t=e.data;void 0===k.WORKER_ID&&t&&(k.WORKER_ID=t.workerId);if("string"==typeof t.input)f.postMessage({workerId:k.WORKER_ID,results:k.parse(t.input,t.config),finished:!0});else if(f.File&&t.input instanceof File||t.input instanceof Object){var r=k.parse(t.input,t.config);r&&f.postMessage({workerId:k.WORKER_ID,results:r,finished:!0})}}:k.WORKERS_SUPPORTED&&(e=document.getElementsByTagName("script"),s=e.length?e[e.length-1].src:"",document.body?document.addEventListener("DOMContentLoaded",function(){a=!0},!0):a=!0),(c.prototype=Object.create(l.prototype)).constructor=c,(p.prototype=Object.create(l.prototype)).constructor=p,(_.prototype=Object.create(_.prototype)).constructor=_,(g.prototype=Object.create(l.prototype)).constructor=g,k});

/***/ })
/******/ ]);