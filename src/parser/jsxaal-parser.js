/**
 * @file jsxaal-parser.js Contains the backbone of the parser.
 */
/**
 * @class JSXaalParser
 */
var JSXaalParser = Class.create({
	/**
	 * Constructor of the parser.
 	 * @function {public void} JSXaalParser
	 * @param {Object} jsviewer
	 */
	initialize: function(jsviewer) {
		this.viewer = jsviewer;
		this.startHandlers = {}; 
		this.stack = {};
	},
	/**
	 * @function {public Object} ?
	 * @param {Object} xmlNode
	 */
	handleElement: function(xmlNode) {
		var sH = this.startHandlers[xmlNode.nodeName.toLowerCase()];
		if (sH) {
			return sH(this.viewer, xmlNode);
		}
	},
	/**
	 * @function {public void} ?
	 * @param {Object} elementName
	 * @param {Object} startHandlerFunction
	 * @param {Object} endHandlerFunction
	 */
	registerElementHandlerFunction: function(elementName, startHandlerFunction) {
		if (startHandlerFunction) {
			this.startHandlers[elementName] = startHandlerFunction;
		}
	}
});