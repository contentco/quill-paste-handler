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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Custom module for quilljs to allow user to change url format and inline images format when copy and paste from their file system into the editor
 * @see https://quilljs.com/blog/building-a-custom-module/
 * extend from author https://github.com/schneidmaster
 */
var Delta = Quill.import('delta');
//import {TableTrick} from '../src/table-break.js';

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

/***/ })
/******/ ]);