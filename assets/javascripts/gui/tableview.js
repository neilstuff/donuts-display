'use strict'
var prefixedTransformCssKey;

var bound = function(x, m, M) {

    if (x < m) {
        return m;
    } else if (x > M) {
        return M;
    } else {
        return x;
    }

};

var smallest_diff_subsequence = function(arr, w) {
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

};

var binary_search = function(arr, x) {
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

};

var distance = function(a1, a2) {

    return Math.abs(a2 - a1);

};

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

var getTranformPrefix = function() {
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

    getHeader(j, cb) {
        var pageName = this.headerPageName(j);

        if (this.__headerPageCache.has(pageName)) {
            return cb(this.__headerPageCache.get(pageName)(j));
        } else if (this.__headerFetchCallbacks[pageName] != null) {
            return this.__headerFetchCallbacks[pageName].push([j, cb]);
        } else {
            this.__headerFetchCallbacks[pageName] = [
                [j, cb]
            ];

            return this.fetchHeaderPage(pageName, (function(__this) {

                return function(page) {

                    var cb, len, n, ref, ref1;

                    __this.__headerPageCache.set(pageName, page);

                    ref = __this.__headerFetchCallbacks[pageName];

                    for (n = 0, len = ref.length; n < len; n++) {

                        ref1 = ref[n], j = ref1[0], cb = ref1[1];

                        cb(page(j));

                    }

                    return delete __this.__headerFetchCallbacks[pageName];

                }

            })(this));

        }

    }

    hasCell(i, j) {
        var pageName = this.cellPageName(i, j);

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

            return this.__fetchCellPage(pageName, (function(__this) {

                return function(page) {

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

    fetchCellPage(pageName, cb) {}

}

class Painter {

    setupCell(cellDiv) {}

    setupHeader(headerDiv) {}

    cleanUpCell(cellDiv) {}

    cleanUpHeader(headerDiv) {}

    cleanUp(table) {

        for (let cell in table.cells) {
            this.cleanUpCell(cell)
        }

        for (let header in table.columns) {
            this.cleanUpHeader(header);
        }

    }

    fillHeader(headerDiv, data) {
        headerDiv.getElementsByTagName('div')[0].textContent = data;
    }

    fillCell(cellDiv, data) {
        cellDiv.textContent = data;
    }

    fillHeaderPending(headerDiv) {
        headerDiv.getElementsByTagName('div')[0].textContent = "Loading...";
    }

    fillCellPending(cellDiv) {
        cellDiv.textContent = "Loading...";
    }

}

class EventRegister {

    constructor() {

        this.boundEvents = [];

    }

    bind(target, evt, cb) {
        this.boundEvents.push([target, evt, cb]);
        return target.addEventListener(evt, cb);
    }

    unbindAll() {
        let cb, evt, len, n, ref1, target;

        let ref = this.boundEvents;

        for (n = 0, len = ref.length; n < len; n++) {
            ref1 = ref[n], target = ref1[0], evt = ref1[1], cb = ref1[2];
            target.removeEventListener(evt, cb);
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

        this.horizontalScrollbar.onscroll = (function(__this) {

            return function() {

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

        this.verticalScrollbar.onscroll = (function(__this) {
            return function() {

                if (!__this.dragging) {
                    if (__this.scrollTop !== __this.verticalScrollbar.scrollTop) {
                        __this.scrollTop = __this.verticalScrollbar.scrollTop;

                        return __this.onScroll(__this.scrollLeft, __this.scrollTop);

                    }

                }

            };

        })(this);

        if (this.enableDragMove) {
            eventRegister.bind(this.container, 'mousedown', (function(__this) {

                return function(evt) {
                    if (evt.button === 1) {
                        __this.dragging = true;
                        __this.container.className = "fattable-body-container fattable-moving";

                        __this.dragging_dX = __this.scrollLeft + evt.clientX;

                        return __this.dragging_dY = __this.scrollTop + evt.clientY;

                    }

                };

            })(this));

            eventRegister.bind(this.container, 'mouseup', (function(__this) {

                return function(evt) {
                    __this.dragging = false;
                    return __this.container.className = "fattable-body-container";
                };

            })(this));

            eventRegister.bind(this.container, 'mousemove', (function(_this) {
                return function(evt) {
                    let deferred = function() {

                        let newX, newY;

                        if (_this.dragging) {

                            newX = -evt.clientX + _this.dragging_dX;
                            newY = -evt.clientY + _this.dragging_dY;

                            return _this.setScrollXY(newX, newY);

                        }

                    };

                    return window.setTimeout(deferred, 0);

                };

            })(this));

            eventRegister.bind(this.container, 'mouseout', (function(__this) {

                return function(evt) {

                    if (__this.dragging) {
                        if ((evt.toElement == null) || (evt.toElement.parentElement.parentElement !== __this.container)) {
                            __this.container.className = "fattable-body-container";
                            return __this.dragging = false;
                        }
                    }

                };

            })(this));

            eventRegister.bind(this.headerContainer, 'mousedown', (function(__this) {

                return function(evt) {

                    if (evt.button === 1) {
                        __this.headerDragging = true;
                        __this.headerContainer.className = "fattable-header-container fattable-moving";

                        return __this.dragging_dX = __this.scrollLeft + evt.clientX;

                    }

                };

            })(this));

            eventRegister.bind(this.container, 'mouseup', (function(__this) {

                return function(evt) {
                    let captureClick;

                    if (evt.button === 1) {
                        __this.headerDragging = false;
                        __this.headerContainer.className = "fattable-header-container";
                        evt.stopPropagation();

                        captureClick = function(e) {
                            e.stopPropagation();

                            return __this.removeEventListener('click', captureClick, true);

                        };

                        return __this.container.addEventListener('click', captureClick, true);

                    }

                };

            })(this));

            eventRegister.bind(this.headerContainer, 'mousemove', (function(__this) {

                return function(evt) {
                    let deferred = function() {
                        var newX;

                        if (__this.headerDragging) {
                            newX = -evt.clientX + __this.dragging_dX;

                            return __this.setScrollXY(newX);

                        }

                    };

                    return window.setTimeout(deferred, 0);

                };

            })(this));

            eventRegister.bind(this.headerContainer, 'mouseout', (function(__this) {

                return function(evt) {

                    if (__this.headerDragging) {

                        if ((evt.toElement == null) || (evt.toElement.parentElement.parentElement !== __this.headerContainer)) {
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

        getDelta = (function() {

            switch (supportedEvent) {

                case "wheel":

                    return function(evt) {
                        let deltaX, deltaY, ref, ref1, ref2, ref3;

                        switch (evt.deltaMode) {

                            case evt.DOM_DELTA_LINE:
                                deltaX = (ref = -50 * evt.deltaX) != null ? ref : 0;
                                deltaY = (ref1 = -50 * evt.deltaY) != null ? ref1 : 0;

                                break;

                            case evt.DOM_DELTA_PIXEL:
                                deltaX = (ref2 = -1 * evt.deltaX) != null ? ref2 : 0;
                                deltaY = (ref3 = -1 * evt.deltaY) != null ? ref3 : 0;

                        }

                        return [deltaX, deltaY];

                    };

                case "mousewheel":

                    return function(evt) {
                        let ref, ref1;
                        let deltaX = 0;
                        let deltaY = 0;

                        deltaX = (ref = evt.wheelDeltaX) != null ? ref : 0;
                        deltaY = (ref1 = evt.wheelDeltaY) != null ? ref1 : evt.wheelDelta;

                        return [deltaX, deltaY];

                    };

                case "DOMMouseScroll":

                    return function(evt) {
                        let deltaX = 0;
                        let deltaY = 0;

                        if (evt.axis === evt.HORIZONTAL_AXI) {
                            deltaX = -50.0 * evt.detail;
                        } else {
                            deltaY = -50.0 * evt.detail;
                        }

                        return [deltaX, deltaY];

                    };

            }

        })();

        onMouseWheel = (function(__this) {

            return function(evt) {

                var deltaX, deltaY, has_scrolled, ref;

                ref = getDelta(evt), deltaX = ref[0], deltaY = ref[1];

                has_scrolled = __this.setScrollXY(__this.scrollLeft - deltaX, __this.scrollTop - deltaY);

                if (has_scrolled) {

                    return evt.preventDefault();

                }

            };

        })(this);

        onMouseWheelHeader = (function(__this) {

            return function(evt) {

                var _, deltaX, has_scrolled, ref;

                ref = getDelta(evt), deltaX = ref[0], _ = ref[1];
                has_scrolled = __this.setScrollXY(__this.scrollLeft - deltaX, __this.scrollTop);

                if (has_scrolled) {

                    return evt.preventDefault();

                }

            };

        })(this);

        eventRegister.bind(this.container, supportedEvent, onMouseWheel);
        eventRegister.bind(this.headerContainer, supportedEvent, onMouseWheelHeader);

    }

    onScroll(x, y) {

    };

    setScrollXY(x, y) {
        let has_scrolled;

        has_scrolled = false;

        if (x != null) {

            x = bound(x, 0, this.maxScrollHorizontal);

            if (this.scrollLeft !== x) {
                has_scrolled = true;
                this.scrollLeft = x;
            }

        } else {
            x = this.scrollLeft;
        }

        if (y != null) {
            y = bound(y, 0, this.maxScrollVertical);

            if (this.scrollTop !== y) {

                has_scrolled = true;
                this.scrollTop = y;

            }

        } else {

            y = this.scrollTop;

        }

        this.horizontalScrollbar.scrollLeft = x;
        this.verticalScrollbar.scrollTop = y;
        this.onScroll(x, y);

        return has_scrolled;

    }

}

class TableView {

    cumsum(arr) {
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

        this.readRequiredParameter(parameters, "painter", new Painter());
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
        this.columnOffset = this.cumsum(this.columnWidths);
        this.width = this.columnOffset[this.columnOffset.length - 1];

        this.columns = {};
        this.cells = {};
        this.currentColumn = null;

        this.getContainerDimension();

        this.eventRegister = new EventRegister();

        this.eventRegister.bind(window, 'resize', (function(__this) {

            return function(event) {

                __this.resize();

            };

        })(this));

        this.eventRegister.bind(document, 'mouseup', (function(__this) {

            return function(evt) {

                __this.currentColumn = null;

            };

        })(this));

        if (this.autoSetup) {

            domReadyPromise.then((function(__this) {

                return function() {

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
        this.nbColsVisible = Math.min(smallest_diff_subsequence(this.columnOffset, this.w) + 2, this.columnWidths.length);
        this.nbRowsVisible = Math.min((this.h / this.rowHeight | 0) + 2, this.nbRows);

    };

    leftTopCornerFromXY(x, y) {

        let i = bound(y / this.rowHeight | 0, 0, this.nbRows - this.nbRowsVisible);
        let j = bound(binary_search(this.columnOffset, x), 0, this.nbCols - this.nbColsVisible);

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
        var iColumn, i, j, n, o, onScroll, p, ref, ref1, ref2, ref3, ref4, ref5;

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

        for (j = n = ref = this.nbColsVisible, ref1 = this.nbColsVisible * 2; n < ref1; j = n += 1) {

            for (i = o = ref2 = this.nbRowsVisible, ref3 = this.nbRowsVisible * 2; o < ref3; i = o += 1) {
                let element = document.createElement("div");

                this.painter.setupCell(element);
                element.pending = false;
                element.style.height = this.rowHeight + "px";

                element.style.textOverflow = "ellipsis";
                element.style.whiteSpace = "nowrap"
                element.style.overflow = "none";

                this.bodyViewport.appendChild(element);
                this.cells[`${i},${j}`] = element;

                element.onmouseover = function(e) {
                    var coordinates = /(\d*),(\d*)/.exec(element.getAttribute("id"));

                    for (var iColumn = __self.firstVisibleColumn; iColumn < __self.firstVisibleColumn + __self.nbColsVisible; iColumn++) {
                        __self.cells[`${coordinates[1]},${iColumn}`].style.backgroundColor = "rgba(0,0,0,0.1)";
                    }


                }

                element.onmouseout = function(e) {
                    var coordinates = /(\d*),(\d*)/.exec(element.getAttribute("id"));

                    for (var iColumn = __self.firstVisibleColumn; iColumn < __self.firstVisibleColumn + __self.nbColsVisible; iColumn++) {
                        __self.cells[`${coordinates[1]},${iColumn}`].style.backgroundColor = "white";
                    }
                }

                element.onmousedown = function(e) {
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

            divider.style.width = "3px";
            divider.style.height = this.headerHeight + "px";
            divider.style.position = "absolute";
            divider.style.right = "2px";
            divider.style.borderRight = "1px solid rgba(0,0,0,0.2)";
            divider.style.cursor = "col-resize";

            var eventRegister = new EventRegister();

            eventRegister.bind(divider, 'mousedown', (function(params) {

                return function(evt) {
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

        onScroll = (function(__this) {

            return function(x, y) {
                var _, cell, col, ref6, ref7, cellRef;

                ref6 = __this.leftTopCornerFromXY(x, y), i = ref6[0], j = ref6[1];

                __this.display(i, j);

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

        this.eventRegister.bind(document, 'mousemove', (function(__this) {

            return function(evt) {

                if (__this.currentColumn != null) {
                    var rect = __this.currentColumn.getBoundingClientRect();
                    var width = evt.pageX - rect.left;
                    console.log(width);

                    if (width < 10) {
                        return;
                    }

                    var diff = width - parseInt(__this.currentColumn.style.width.replace('px', ''));

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
        var cell, fn, header, i, j, k, n, ref, ref1, results;

        if (evenNotPending == null) {

            evenNotPending = false;

        }

        fn = (function(__this) {

            return function(header) {

                if (evenNotPending || header.pending) {

                    return __this.model.getHeader(j, function(data) {

                        header.pending = false;

                        return __this.painter.fillHeader(header, data);

                    });

                }

            };

        })(this);

        results = [];

        for (j = n = ref = this.firstVisibleColumn, ref1 = this.firstVisibleColumn + this.nbColsVisible; n < ref1; j = n += 1) {

            header = this.columns[j];

            fn(header);

            results.push((function() {
                var o, ref2, ref3, results1;

                results1 = [];

                for (i = o = ref2 = this.firstVisibleRow, ref3 = this.firstVisibleRow + this.nbRowsVisible; o < ref3; i = o += 1) {

                    k = i + "," + j;

                    cell = this.cells[k];

                    if (evenNotPending || cell.pending) {
                        results1.push((function(__this) {

                            return function(cell) {

                                return __this.model.getCell(i, j, function(data) {
                                    cell.pending = false;
                                    return __this.painter.fillCell(cell, data);

                                });

                            };

                        })(this)(cell));

                    } else {

                        results1.push(void 0);

                    }

                }

                return results1;

            }).call(this));

        }

        return results;

    };

    onScroll(x, y) {};

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
        var cell, col_width, col_x, dest_j, dj, fn, header, i, k, last_i, last_j, n, o, offset_j, orig_j, ref, ref1, ref2, shift_j;

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
                dest_j = j + offset_j + this.nbColsVisible - dj;

            } else {
                orig_j = this.firstVisibleColumn + this.nbColsVisible - dj + offset_j;
                dest_j = j + offset_j;

            }

            col_x = this.columnOffset[dest_j];

            col_width = this.columnWidths[dest_j] + "px";

            header = this.columns[orig_j];

            delete this.columns[orig_j];

            if (this.model.hasHeader(dest_j)) {

                this.model.getHeader(dest_j, (function(_this) {

                    return function(data) {

                        header.pending = false;

                        return _this.painter.fillHeader(header, data);

                    };

                })(this));

            } else if (!header.pending) {

                header.pending = true;

                this.painter.fillHeaderPending(header);

            }

            header.left = col_x;

            header.style.width = col_width;

            this.columns[dest_j] = header;

            fn = (function(__this) {

                return function(cell) {

                    if (__this.model.hasCell(i, dest_j)) {

                        return __this.model.getCell(i, dest_j, function(data) {

                            cell.pending = false;

                            return __this.painter.fillCell(cell, data);

                        });

                    } else if (!cell.pending) {

                        cell.pending = true;

                        return __this.painter.fillCellPending(cell);

                    }

                };

            })(this);

            for (i = o = ref1 = last_i, ref2 = last_i + this.nbRowsVisible; o < ref2; i = o += 1) {

                k = i + "," + orig_j;

                cell = this.cells[k];
                delete this.cells[k];

                this.cells[i + "," + dest_j] = cell;
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

            fn = (function(__this) {

                return function(cell) {
                    cell.setAttribute("id", `${dest_i},${j}`);

                    if (__this.model.hasCell(dest_i, j)) {

                        return __this.model.getCell(dest_i, j, function(data) {

                            cell.pending = false;

                            return __this.painter.fillCell(cell, data);

                        });

                    } else if (!cell.pending) {

                        cell.pending = true;

                        return __this.painter.fillCellPending(cell);

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