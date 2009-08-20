/**
 * A class containing several utility functions for the Xaal viewer.
 * @class JSXaal.Util
 */
JSXaal.Util = new Object();
JSXaal.Util.colorNames = new Hash({ maroon: {r:128,g:0,b:0}, red:{r:255,g:0,b:0}, orange:{r:255,g:165,b:0}, yellow:{r:255,g:255,b:0},
 olive:{r:128,g:128,b:0}, purple:{r:128,g:0,b:128}, fuchsia:{r:255,g:0,b:255}, white:{r:255,g:255,b:255},
  lime:{r:0,g:255,b:0}, green:{r:0,g:128,b:0}, navy:{r:0,g:0,b:128}, blue:{r:0,g:0,b:255}, aqua:{r:0,g:255,b:255},
  teal:{r:0,g:128,b:128}, black:{r:0,g:0,b:0}, silver:{r:192,g:192,b:192}, gray:{r:128,g:128,b:128} });
/**
 * @function {public void} ?
 * @param {Object} colorName
 */
JSXaal.Util.convertColorName = function(colorName) {
	return this.colorNames.get(colorName);
};
/**
 * 
 */
JSXaal.Util.colorNameToString = function(colorName) {
	var col = JSXaal.Util.convertColorName(colorName);
	if (col) {
		return "rgb(" + col.r + "," + col.g + "," + col.b + ")";
	} else {
		return "rgb(0,0,0)";
	}
};
/**
 * @function {public void} ?
 * @param {Object} colorNode
 */
JSXaal.Util.convertColor = function(colorNode) {
	var name = colorNode.readAttribute("name");
	if (name) {
		return JSXaal.Util.convertColorName(name);
	}
	var red = colorNode.readAttribute("red") || 0;
	var green = colorNode.readAttribute("green") || 0;
	var blue = colorNode.readAttribute("blue") || 0;
	return {r:red, g:green, b:blue};
};
/**
 * @function {public void} ?
 * @param {Object} colorNode
 */
JSXaal.Util.colorToString = function(colorNode) {
	var col = JSXaal.Util.convertColor(colorNode);
	return "rgb(" + col.r + "," + col.g + "," + col.b + ")"; 	
};
/**
 * Converts the given color string into a javascript hash with r, g, and b entries.
 * The given string should be in format <code>rgb(255,255,255)</code>.
 * NOTE: this method does not return a Prototype Hash.
 * @function {public void} ?
 * @param {Object} colorString
 * @return {Hash}
 */
JSXaal.Util.colorstringToHash = function(colorString) {
	if (colorString.indexOf("rgb(") == 0) {
		colorString = colorString.substring(4, colorString.length -1);
		colorString = colorString.split(',');
		return {r: colorString[0], g: colorString[1], b: colorString[2]}; 
	}
}
/**
 * @function {public void} ?
 * @param {Object} node
 */
JSXaal.Util.getTextContents = function(nodes, lang) {
	lang = lang || 'en';
	var nodeIndex = 0;
	if (nodes.length > 1) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].hasAttribute("lang") && nodes[i].readAttribute("lang") == lang) {
				nodeIndex = i;
				break; 
			}
		}
	}
	var children = nodes[nodeIndex].childNodes;
	var msg = "";
	var j = 0;
	for (;j<children.length;j++) {
		if (children[j].nodeType == 3) { // textnodes
			msg += children[j].nodeValue;
		}
	}
	return msg;
};
JSXaal.Util.shapeCounter = 0;
/**
 * @function {public void} ?
 * @param {Object} shape
 */
JSXaal.Util.generateID = function(shape, viewerId) {
	shape.setID("jsxaalautoshape" + JSXaal.Util.shapeCounter + viewerId);
	JSXaal.Util.shapeCounter++;
};
/**
 * Sets the ID of the given shape to be the id of the given xmlNode. If the
 * xmlNode has no id attribute, an ID will be generated for the shape.
 * @function {public void} ?
 * @param {Object} shape The shape that should have its ID set
 * @param {Object} xmlNode The xmlNode
 */
JSXaal.Util.setID = function(shape, xmlNode, viewerId) {
	var id = xmlNode.readAttribute("id");
	if (id) {
		shape.setID(id + viewerId);
	} else {
		JSXaal.Util.generateID(shape, viewerId);
	}
};
/**
 * @function {public void} ?
 * @param {Object} o
 */
JSXaal.Util.isShapeObject = function(o) {
	return (o instanceof Graphic.Rectangle || o instanceof Graphic.Circle ||
		o instanceof Graphic.Line || o instanceof Graphic.Polygon ||
		o instanceof Graphic.Polyline || o instanceof Graphic.Text);
};
JSXaal.Util.useShapeObject = function(viewer, shape, coordinate, scale) {
	// TODO: Clone the shape before use
	var newShape = JSXaal.Util.cloneShapeObject(viewer, shape);
	// TODO: store the clones in case the original shape is changed 
	newShape.translate(coordinate.x, coordinate.y);
	newShape.scale(scale, scale);
	viewer.renderer.add(newShape);
};
JSXaal.Util.cloneShapeObject = function(viewer, shape) {
	var newShape;
	if (shape instanceof Graphic.Polygon) {
		newShape = new Graphic.Polygon(viewer.renderer);
		newShape._setAttributes(Object.toJSON(shape.attributes).evalJSON());
        newShape.setPoints(shape.getPoints());
	} else if (shape instanceof Graphic.Circle) {
		newShape = new Graphic.Circle(viewer.renderer);
		newShape._setAttributes(Object.toJSON(shape.attributes).evalJSON());
	}
	debug('new id '+newShape.getID());
	return newShape;
}
/**
 * @function {public void} ?
 * @param {Object} node
 */
JSXaal.Util.getContentsAsText = function(node) {
	var text = "";
	var children = node.childNodes;
	var j = 0;
	for (;j<children.length;j++) {
		if (children[j].nodeType == 3) { // textnodes
			text += children[j].nodeValue;
		} else if (children[j].nodeType == 1) {
			text += "<" + children[j].nodeName;
			var i = 0;
			for (;i<children[j].attributes.length; i++) {
				text += " " + children[j].attributes[i].nodeName + '="';
				text += children[j].attributes[i].nodeValue + '"'
			}
			text += ">";
			text += JSXaal.Util.getContentsAsText(children[j]);
			text += "</" + children[j].nodeName + ">";
		}
	}
	return text;
};
/**
 * Parses a given String to an XMLDocument.
 * @function {public XMLDocument} ?
 * @param {String} text
 */
JSXaal.Util.stringToXml =  function(text) { 
	try {
		var xmlDoc = new ActiveXObject('Microsoft.XMLDOM'); 
		xmlDoc.async = 'false'; 
		xmlDoc.loadXML(text); 
		return xmlDoc;
	} catch(e) {
		debug(e);
		try {
			return new DOMParser().parseFromString(text.strip(), 'text/xml'); 
		} catch(e) { debug(e);return null }
	}
};
/**
 * Returns a Prototype extended copy of the given element.
 * @function {public Element} ?
 * @param {Object} docRoot
 */
JSXaal.Util.recreateDocument = function(docRoot, viewer) {
	var newRoot = new Element(docRoot.nodeName);
	JSXaal.Util.copyChildElements(docRoot, newRoot, viewer);
	return newRoot;
};
/**
 * Copies attributes from the fromElem to the toElem.
 * @function {private void} ?
 * @param {Object} fromElem
 * @param {Object} toElem
 */
JSXaal.Util.copyAttributes = function(fromElem, toElem, viewer) {
	// TODO: In Opera: attribute named length overwrites the length property of the attributes
	//       array. How to handle this?
	for (var i=0;i<fromElem.attributes.length; i++) {
		var attr = fromElem.attributes[i];
		if (attr.nodeName == 'style') {
			toElem.setAttribute('x-style', attr.nodeValue);
		} else if (attr.nodeName == 'lang') {
			viewer.settings.addLanguage(attr.nodeValue);
		}
		toElem.setAttribute(attr.nodeName, attr.nodeValue);
	}
};
/**
 * Copies child elements from the fromElem to the toElem. Empty whitespace nodes
 * are ignored.
 * @function {private void} ?
 * @param {Object} fromElem
 * @param {Object} toElem
 */JSXaal.Util.copyChildElements = function(fromElem, toElem, viewer) {
	 if (fromElem.nodeName =='radius') {debug("radius elem"+fromElem.getAttribute("length"));}
	JSXaal.Util.copyAttributes(fromElem, toElem, viewer);
	var children = fromElem.childNodes;
	var length = children.length;
	for (var i=0; i < length; i++) {
		var child = children[i];
		if (child.nodeType == 3 && !child.nodeValue.blank()) {
			toElem.appendChild(document.createTextNode(child.nodeValue));
		} else if (child.nodeType == 1) {
			var nodeName = child.nodeName;
			if (nodeName.toLowerCase() == 'style') {
				nodeName = 'x-' + nodeName;
			}
			var elem = new Element(nodeName);
			toElem.appendChild(elem);
			JSXaal.Util.copyChildElements(child, elem, viewer);
		}
	}
};
String.prototype.isXaalNode = function(nodeName) {
	return this.toLowerCase() == ("x-" + nodeName.toLowerCase());	
};