/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.PasteHandler = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tableBreak = __webpack_require__(3);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Custom module for quilljs to allow user to change url format and inline images format when copy and paste from their file system into the editor
 * @see https://quilljs.com/blog/building-a-custom-module/
 * extend from author https://github.com/schneidmaster
 */
var Delta = Quill.import('delta');

var PasteHandler = exports.PasteHandler = function () {
	function PasteHandler(quill, options) {
		_classCallCheck(this, PasteHandler);

		// save the quill reference
		this.quill = quill;
		// bind handlers to this instance
		this.handlePaste = this.handlePaste.bind(this);
		this.handleGetData = this.handleGetData.bind(this);
		this.quill.root.addEventListener('paste', this.handlePaste, false);
		this.quill.once('editor-change', this.handleGetData, false);
	}

	_createClass(PasteHandler, [{
		key: 'handlePaste',
		value: function handlePaste(evt) {
			if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {
				this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
					var regex = /https?:\/\/[^\s]+/g;
					if (typeof node.data !== 'string') return;
					var matches = node.data.match(regex);
					if (matches && matches.length > 0) {
						var ops = [];
						var str = node.data;
						matches.forEach(function (match) {
							var split = str.split(match);
							var beforeLink = split.shift();
							ops.push({ insert: beforeLink });
							ops.push({ insert: match, attributes: { link: match } });
							str = split.join(match);
						});
						ops.push({ insert: str });
						delta.ops = ops;
					}
					return delta;
				});

				this.quill.clipboard.addMatcher('LI', function (node, delta) {
					var style = window.getComputedStyle(node);
					var list_style = style.getPropertyValue('list-style-type');
					if (list_style) {
						var ops = [];
						var str = node.textContent;
						if (list_style == 'decimal') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "list": "ordered" } });
						} else if (list_style == 'lower-alpha') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "indent": 1, "list": "ordered" } });
						} else if (list_style == 'lower-roman') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "indent": 2, "list": "ordered" } });
						} else if (list_style == 'disc') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "list": "bullet" } });
						} else if (list_style == 'circle') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "indent": 1, "list": "bullet" } });
						} else if (list_style == 'square') {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "indent": 2, "list": "bullet" } });
						} else {
							ops.push({ "insert": str }, { "insert": "\n", "attributes": { "list": "ordered" } });
						}
						delta.ops = ops;
					};
					return delta;
				});
			}
		}
	}, {
		key: 'handleGetData',
		value: function handleGetData(evt) {
			var current_container = this.quill.container;
			var editor = current_container.children[0];
			var current_html = editor.innerHTML;
			// this.quill.clipboard.addMatcher('TD', function(node, delta) {
			//         	delta.insert("\n", { td: true })
			//           delta.insert({ tdbr: true });
			//           return delta;
			//       });

			//       this.quill.clipboard.addMatcher('TR', function(node, delta) {
			//         	delta.insert({ trbr: true });
			//           return delta;
			//       });	
		}
	}]);

	return PasteHandler;
}();

Quill.register('modules/pasteHandler', PasteHandler);

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _base = __webpack_require__(1);

var _base2 = _interopRequireDefault(_base);

var _modulePasteHandler = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = Quill.import('blots/container');
var Scroll = Quill.import('blots/scroll');
var Inline = Quill.import('blots/inline');
var Block = Quill.import('blots/block');
//let Delta = Quill.import('delta');
var Parchment = Quill.import('parchment');
var BlockEmbed = Quill.import('blots/block/embed');
var TextBlot = Quill.import('blots/text');

var ContainBlot = function (_Container) {
  _inherits(ContainBlot, _Container);

  function ContainBlot() {
    _classCallCheck(this, ContainBlot);

    return _possibleConstructorReturn(this, (ContainBlot.__proto__ || Object.getPrototypeOf(ContainBlot)).apply(this, arguments));
  }

  _createClass(ContainBlot, [{
    key: 'insertBefore',
    value: function insertBefore(blot, ref) {
      if (blot.statics.blotName == this.statics.blotName) {
        _get(ContainBlot.prototype.__proto__ || Object.getPrototypeOf(ContainBlot.prototype), 'insertBefore', this).call(this, blot.children.head, ref);
      } else {
        _get(ContainBlot.prototype.__proto__ || Object.getPrototypeOf(ContainBlot.prototype), 'insertBefore', this).call(this, blot, ref);
      }
    }
  }, {
    key: 'formats',
    value: function formats() {
      // We don't inherit from FormatBlot
      return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
    }
  }, {
    key: 'replace',
    value: function replace(target) {
      if (target.statics.blotName !== this.statics.blotName) {
        var item = Parchment.create(this.statics.defaultChild);
        target.moveChildren(item);
        this.appendChild(item);
      }
      if (target.parent == null) return;
      _get(ContainBlot.prototype.__proto__ || Object.getPrototypeOf(ContainBlot.prototype), 'replace', this).call(this, target);
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var tagName = 'contain';
      var node = _get(ContainBlot.__proto__ || Object.getPrototypeOf(ContainBlot), 'create', this).call(this, tagName);
      return node;
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      return domNode.tagName;
    }
  }]);

  return ContainBlot;
}(Container);

ContainBlot.blotName = 'contain';
ContainBlot.tagName = 'contain';
ContainBlot.scope = Parchment.Scope.BLOCK_BLOT;
ContainBlot.defaultChild = 'block';
ContainBlot.allowedChildren = [Block, BlockEmbed, Container];
Quill.register(ContainBlot);

var TableRow = function (_Container2) {
  _inherits(TableRow, _Container2);

  function TableRow() {
    _classCallCheck(this, TableRow);

    return _possibleConstructorReturn(this, (TableRow.__proto__ || Object.getPrototypeOf(TableRow)).apply(this, arguments));
  }

  _createClass(TableRow, [{
    key: 'optimize',
    value: function optimize() {
      _get(TableRow.prototype.__proto__ || Object.getPrototypeOf(TableRow.prototype), 'optimize', this).call(this);
      var parent = this.parent;
      if (parent != null && parent.statics.blotName != 'table') {
        this.processTable();
      }
    }
  }, {
    key: 'processTable',
    value: function processTable() {
      var currentBlot = this;
      var rows = [];
      while (currentBlot) {
        if (!(currentBlot instanceof TableRow)) {
          break;
        }
        rows.push(currentBlot);
        currentBlot = currentBlot.next;
      }
      var mark = Parchment.create('block');
      this.parent.insertBefore(mark, this.next);
      var table = Parchment.create('table');
      rows.forEach(function (row) {
        table.appendChild(row);
      });
      table.replace(mark);
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var tagName = 'tr';
      var node = _get(TableRow.__proto__ || Object.getPrototypeOf(TableRow), 'create', this).call(this, tagName);
      return node;
    }
  }]);

  return TableRow;
}(Container);

TableRow.blotName = 'tr';
TableRow.tagName = 'tr';
TableRow.scope = Parchment.Scope.BLOCK_BLOT;
TableRow.defaultChild = 'td';
Quill.register(TableRow);

var Table = function (_Container3) {
  _inherits(Table, _Container3);

  function Table() {
    _classCallCheck(this, Table);

    return _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).apply(this, arguments));
  }

  _createClass(Table, [{
    key: 'optimize',
    value: function optimize() {
      _get(Table.prototype.__proto__ || Object.getPrototypeOf(Table.prototype), 'optimize', this).call(this);
      var next = this.next;
      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName) {
        next.moveChildren(this);
        next.remove();
      }
    }
  }]);

  return Table;
}(Container);

Table.blotName = 'table';
Table.tagName = 'table';
Table.scope = Parchment.Scope.BLOCK_BLOT;
Table.defaultChild = 'tr';
Table.allowedChildren = [TableRow];
Quill.register(Table);

//
//
// CONTAINER TD
//

var TableCell = function (_ContainBlot) {
  _inherits(TableCell, _ContainBlot);

  function TableCell() {
    _classCallCheck(this, TableCell);

    return _possibleConstructorReturn(this, (TableCell.__proto__ || Object.getPrototypeOf(TableCell)).apply(this, arguments));
  }

  _createClass(TableCell, [{
    key: 'format',
    value: function format() {
      return 'td';
    }
  }, {
    key: 'optimize',
    value: function optimize() {
      _get(TableCell.prototype.__proto__ || Object.getPrototypeOf(TableCell.prototype), 'optimize', this).call(this);
      var parent = this.parent;
      if (parent != null && parent.statics.blotName != 'tr') {
        this.processTR();
      }
      // merge same TD id
      var next = this.next;
      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName) {
        next.moveChildren(this);
        next.remove();
      }
    }
  }, {
    key: 'processTR',
    value: function processTR() {
      // find next row break
      var currentBlot = this;
      var rowItems = [this];
      while (currentBlot) {
        if (currentBlot.statics.tagName !== 'TD') {
          break;
        }
        rowItems.push(currentBlot);
        if (currentBlot instanceof RowBreak) {
          break;
        }
        currentBlot = currentBlot.next;
      }
      // create row, add row items as TDs
      var prevItem;
      var cellItems = [];
      var cells = [];
      rowItems.forEach(function (rowItem) {
        cellItems.push(rowItem);
        if (rowItem instanceof TableCell) {
          prevItem = rowItem;
        } else if (rowItem instanceof CellBreak) {
          cells.push(cellItems);
          cellItems = [];
        }
      });
      if (cellItems.length > 0) {
        cells.push(cellItems);
      }
      var mark = Parchment.create('block');
      this.parent.insertBefore(mark, this.next);
      // create row
      var row = Parchment.create('tr');
      cells.forEach(function (cell) {
        // add row elements
        cell.forEach(function (cellItem) {
          row.appendChild(cellItem);
        });
      });
      row.replace(mark);
    }
  }]);

  return TableCell;
}(ContainBlot);

TableCell.blotName = 'td';
TableCell.tagName = 'td';
TableCell.scope = Parchment.Scope.BLOCK_BLOT;
TableCell.defaultChild = 'block';
TableCell.allowedChildren = [Block, BlockEmbed, Container];
Quill.register(TableCell);

Container.order = ['list', 'contain', // Must be lower
'td', 'tr', 'table' // Must be higher
];

var RowBreak = function (_BlockEmbed) {
  _inherits(RowBreak, _BlockEmbed);

  function RowBreak() {
    _classCallCheck(this, RowBreak);

    return _possibleConstructorReturn(this, (RowBreak.__proto__ || Object.getPrototypeOf(RowBreak)).apply(this, arguments));
  }

  _createClass(RowBreak, [{
    key: 'formats',
    value: function formats() {
      return { trbr: true };
    }
  }]);

  return RowBreak;
}(BlockEmbed);

RowBreak.blotName = 'trbr';
RowBreak.tagName = 'td';
RowBreak.className = 'trbr';

Quill.register(RowBreak);

var CellBreak = function (_BlockEmbed2) {
  _inherits(CellBreak, _BlockEmbed2);

  function CellBreak() {
    _classCallCheck(this, CellBreak);

    return _possibleConstructorReturn(this, (CellBreak.__proto__ || Object.getPrototypeOf(CellBreak)).apply(this, arguments));
  }

  _createClass(CellBreak, [{
    key: 'formats',
    value: function formats() {
      return { tdbr: true };
    }
  }]);

  return CellBreak;
}(BlockEmbed);

CellBreak.blotName = 'tdbr';
CellBreak.tagName = 'td';
CellBreak.className = 'tdbr';
Quill.register(CellBreak);

// END quill-table-breaks.js


// Render UI
var Keyboard = Quill.import('modules/keyboard');

// set up toolbar options
var maxRows = 10;
var maxCols = 5;
var tableOptions = [];
for (var r = 1; r <= maxRows; r++) {
  for (var c = 1; c <= maxCols; c++) {
    tableOptions.push('newtable_' + r + '_' + c);
  }
}

Quill.debug('debug');

/***/ })
/******/ ]);