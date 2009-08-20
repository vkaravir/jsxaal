var JSXaalMainParser = {};
JSXaalMainParser.register = function(parser) {
	parser.registerElementHandlerFunction("defs", JSXaalMainParser.renderDefsElement);
	parser.registerElementHandlerFunction("define-shape", JSXaalMainParser.renderShapeDefElement);
};
JSXaalMainParser.renderDefsElement = function(viewer, defsNode) {
	var children = defsNode.childElements();
	var length = children.length;
	for (var i = 0; i < length; i++) {
		viewer.parser.handleElement(children[i]);
	}
};
JSXaalMainParser.renderShapeDefElement = function (viewer, shapeDef) {
	var children = shapeDef.childElements();
	var shapes = new Array();
	children.each(function(item) {
		var shape = viewer.parser.handleElement(item);
		shapes.push(shape);
	});
	if (!viewer.shapes) {
		viewer.shapes = new Hash();
	}
	debug("shapedef id "+shapeDef.readAttribute("name"));
	viewer.shapes[shapeDef.readAttribute("name")] = shapes;
};