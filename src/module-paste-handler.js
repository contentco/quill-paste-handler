/**
 * Custom module for quilljs to allow user to change url format and inline images format when copy and paste from their file system into the editor
 * @see https://quilljs.com/blog/building-a-custom-module/
 * extend from author https://github.com/schneidmaster
 */
let Delta = Quill.import('delta');
//import {TableTrick} from '../src/table-break.js';
export class PasteHandler {
	constructor(quill, options) {
		// save the quill reference
		this.quill = quill;
		// bind handlers to this instance
		this.handlePaste = this.handlePaste.bind(this);
		this.handleGetData = this.handleGetData.bind(this);
		this.quill.root.addEventListener('paste', this.handlePaste, false);
		this.quill.once('editor-change', this.handleGetData, false);
	}
	handlePaste(evt) {

		if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {
			this.quill.clipboard.addMatcher(Node.TEXT_NODE, function(node, delta) {
				let regex = /https?:\/\/[^\s]+/g;
				if(typeof(node.data) !== 'string') return;
				let matches = node.data.match(regex);
			  	if(matches && matches.length > 0) {
				    let ops = [];
				    let str = node.data;
				    matches.forEach(function(match) {
				      	let split = str.split(match);
				      	let beforeLink = split.shift();
				      	ops.push({ insert: beforeLink });
				      	ops.push({ insert: match, attributes: { link: match } });
				      	str = split.join(match);
				    });
				    ops.push({ insert: str });
				    delta.ops = ops;
			  	}
				return delta;
			});

	        this.quill.clipboard.addMatcher('LI', function(node, delta) {
				let style = window.getComputedStyle(node);
				let list_style = style.getPropertyValue('list-style-type');
				if (list_style) {
					let ops = [];
					let str = node.textContent;
					if (list_style == 'decimal') {
						ops.push({"insert":str},{"insert":"\n","attributes":{"list":"ordered"}});
					}
					else if (list_style == 'lower-alpha') {
						ops.push({"insert":str},{"insert":"\n","attributes":{"indent":1,"list":"ordered"}});
					}
					else if(list_style == 'lower-roman'){
						ops.push({"insert":str},{"insert":"\n","attributes":{"indent":2,"list":"ordered"}});
					}
					else if(list_style == 'disc'){
						ops.push({"insert":str},{"insert":"\n","attributes":{"list":"bullet"}});
					}
					else if(list_style == 'circle'){
						ops.push({"insert":str},{"insert":"\n","attributes":{"indent":1,"list":"bullet"}});
					}
					else if(list_style == 'square'){
						ops.push({"insert":str},{"insert":"\n","attributes":{"indent":2,"list":"bullet"}});
					}
					else{
						ops.push({"insert":str},{"insert":"\n","attributes":{"list":"ordered"}});
					}
					delta.ops = ops;
				};
				return delta;
			});
		}

		// Remove background and color
		quill.clipboard.addMatcher (Node.ELEMENT_NODE, function (node, delta) {
			delta.ops.forEach(function (match) {
				console.log(match);
				if (match.attributes && match.attributes.background) {
					delete match.attributes.background;
				}
		
				if (match.attributes && match.attributes.color) {
					delete match.attributes.color;
				}
			});
			return delta;
		});

	}
	handleGetData(evt){
		let current_container = this.quill.container;
		let editor = current_container.children[0];
		let current_html = editor.innerHTML;
	}
}
Quill.register('modules/pasteHandler', PasteHandler);
