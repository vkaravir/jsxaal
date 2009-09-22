/**
 * @class JSXaalParserGP
 */
var JSXaalParserGP = {};
JSXaalParserGP.register = function(parser) {
	parser.registerElementHandlerFunction("rectangle", JSXaalParserGP.renderRectangleElement);
	parser.registerElementHandlerFunction("text", JSXaalParserGP.renderTextElement);
	parser.registerElementHandlerFunction("circle", JSXaalParserGP.renderCircleElement);
	parser.registerElementHandlerFunction("line", JSXaalParserGP.renderLineElement);
	parser.registerElementHandlerFunction("polyline", JSXaalParserGP.renderPolylineElement);
	parser.registerElementHandlerFunction("triangle", JSXaalParserGP.renderTriangleElement);
	parser.registerElementHandlerFunction("polygon", JSXaalParserGP.renderPolygonElement);
	parser.registerElementHandlerFunction("student-annotation", JSXaalParserGP.renderAnnotationElement);
	parser.registerElementHandlerFunction("shape", JSXaalParserGP.renderShapeElement);
};
/**
 * @function {public Graphic.Rectangle} ?
 * @param {Object} viewer
 * @param {Object} rectNode
 */
JSXaalParserGP.renderRectangleElement = function(viewer, rectNode) {
	var children = rectNode.childElements();
	var rect = new Graphic.Rectangle(viewer.renderer);
	JSXaal.Util.setID(rect, rectNode, viewer.id);
	var coordCount = 0;
	JSXaalParserGP.handleStyle(viewer, rectNode, rect);
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		switch (child.nodeName.toLowerCase()) {
		case 'coordinate':
			if (coordCount === 0) {
				var coord = JSXaalParserGP.getCoordinate(viewer, child);
				rect.setLocation(coord.x, coord.y);
				coordCount++;						
			} else {
				var coord2 = JSXaalParserGP.getCoordinate(viewer, child);
				rect.setSize(coord2.x - rect.getLocation().x, 
						coord2.y - rect.getLocation().y);
			}
			break;
		case 'round':
			var rx = Number(child.readAttribute("x"));
			var ry = Number(child.readAttribute("y"));
			if (!rx && ry) { rx = ry; }
			else if (rx && !ry) { ry = rx; }
			if (rx && ry) {
				rect.setRoundCorner(rx, ry);
			}
			break;
		default:
			break;
		}
	}
	return rect;
};
/**
 * @function {private void} ?
 * @param {Object} viewer
 * @param {Object} xmlNode
 * @param {Object} shape
 */
JSXaalParserGP.handleStyle = function(viewer, xmlNode, shape) {
	var style;
	var styleId = xmlNode.readAttribute("x-style");
	if (styleId) {
		style = viewer.styleStore[styleId];
		JSXaalParserGP.applyStyle(style, shape);
	} else {
		var s = xmlNode.getElementsByTagName("x-style")[0];
		if (s) {
			style = JSXaalParserGP.parseStyle(s, viewer);
			JSXaalParserGP.applyStyle(style, shape);
		} else {
			shape.setStroke({r:0, g:0, b:0});
		}
	}
	var opacity = xmlNode.readAttribute("opacity");
	if (opacity) {
		opacity = Number(opacity)*255;
		if (shape.getStroke() != "none") { shape.setStrokeOpacity(opacity); }
		if (shape.getFill() != "none") { shape.setFillOpacity(opacity); }
	}
	var hidden = xmlNode.readAttribute("hidden");
	if (hidden == 'true') {
		if (shape.getStroke() != "none") { shape.setStrokeOpacity(0.001); }
		if (shape.getFill() != "none") { shape.setFillOpacity(0.001); }
	}
	return style;
};
/**
 * Applies a given style to the given shape.
 * @function {private void} ?
 * @param {Object} node
 * @param {Object} shape
 * @param {Object} viewer
 */
JSXaalParserGP.applyStyle = function(style, shape) {
	if (shape instanceof Graphic.Text) {
		JSXaalRenderer.setKeyStyle(shape, style);
	} else {
		JSXaalRenderer.setShapeStyle(shape, style);
	}
};
/**
 * Parses and returns a style from the given node.
 * @function {private void} ?
 * @param {Object} node
 * @param {Object} viewer
 */
JSXaalParserGP.parseStyle = function(node, viewer) {
	var children = node.childElements();
	var style = new Style();
	var id = node.readAttribute("id");
	if (id) {
		viewer.styleStore[id] = style;
		style.setId(id);
	}
	var childName;
	var child;
	for (var j = 0; j < children.length;j++) {
		child = children[j];
		childName = child.nodeName.toLowerCase();
		if (childName == 'font') {
			if (child.hasAttribute("size")) {
				style.setFontSize(child.getAttribute("size"));
			}
			if (child.hasAttribute("family")) {
				style.setFontFamily(child.getAttribute("family"));
			}
			if (child.hasAttribute("bold")) {
				style.setBold(child.getAttribute("bold"));
			}
			if (child.hasAttribute("italic")) {
				style.setItalic(child.getAttribute("italic"));
			}
		} else if (childName == 'color') {
			style.setColor(JSXaal.Util.convertColor(child));
		} else if (childName == 'fill-color') {
			style.setFillColor(JSXaal.Util.convertColor(child));
		} else if (childName == 'stroke') {
			var width = child.readAttribute("width");
			if (width) {
				style.setStrokeWidth(Number(width));
			}
		} else if (childName == 'arrow') {
			if (child.hasAttribute("forward")) {
				style.setForwardArrow(child.getAttribute("forward").toLowerCase() == "true");
			}
			if (child.hasAttribute("backward")) {
				style.setBackwardArrow(child.getAttribute("backward").toLowerCase() == "true");
			}
		}
	}
	return style;
};
/**
 * @function {public Graphic.Polyline} ?
 * @param {Object} viewer
 * @param {Object} polylineNode
 */
JSXaalParserGP.renderPolylineElement = function(viewer, polylineNode) {
	var children = polylineNode.childElements();
	var polyline = new Graphic.Polyline(viewer.renderer);
	JSXaal.Util.setID(polyline, polylineNode, viewer.id);
	JSXaalParserGP.handleStyle(viewer, polylineNode, polyline);
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'coordinate') {
			var point = JSXaalParserGP.getCoordinate(viewer, child);
			polyline.addPoint(point.x, point.y);
		}
	}
	return polyline;	
};
/**
 * @function {public Graphic.Polygon} ?
 * @param {Object} viewer
 * @param {Object} polygonNode
 */
JSXaalParserGP.renderPolygonElement = function(viewer, polygonNode) {
	var children = polygonNode.childElements();
	var polygon = new Graphic.Polygon(viewer.renderer);
	JSXaal.Util.setID(polygon, polygonNode, viewer.id);
	JSXaalParserGP.handleStyle(viewer, polygonNode, polygon);
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'coordinate') {
			var point = JSXaalParserGP.getCoordinate(viewer, child);
			polygon.addPoint(point.x, point.y);
		}
	}
	return polygon;		
};
JSXaalParserGP.renderTriangleElement = function(viewer, triangleNode) {
	var polygon = JSXaalParserGP.renderPolygonElement(viewer, triangleNode);
	firstPoint = polygon.getPoint(0);
	polygon.addPoint(firstPoint.x, firstPoint.y);
	return polygon;
};
/**
 * @function {public Graphic.Line} ?
 * @param {Object} viewer
 * @param {Object} lineNode
 */
JSXaalParserGP.renderLineElement = function(viewer, lineNode) {
	var children = lineNode.childElements();
	var line = new Graphic.Line(viewer.renderer);
	JSXaal.Util.setID(line, lineNode, viewer.id);
	var style = JSXaalParserGP.handleStyle(viewer, lineNode, line);
	var coord;
	var coord2;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'coordinate') {
			if (!coord) {
				coord = JSXaalParserGP.getCoordinate(viewer, child);
			} else {
				coord2 = JSXaalParserGP.getCoordinate(viewer, child);
				line.setPoints(coord.x, coord.y, coord2.x, coord2.y);
			}
		}
	}
	var group = new Graphic.Group(viewer.renderer);
	if (style && style.isForwardArrow()) {
		JSXaalRenderer.renderArrow(coord, coord2, line.getID()+(JSXaalRenderer.counter++),
				style, group);
    }
	if (style && style.isBackwardArrow()) {
		JSXaalRenderer.renderArrow(coord2, coord, line.getID()+(JSXaalRenderer.counter++),
				style, group);
    }
	// TODO: need to figure out how to draw arrows so that they move if the line moves
	viewer.renderer.add(group);
	return line;		
};
/**
 * @function {public Graphic.Circle} ?
 * @param {Object} viewer
 * @param {Object} circleNode
 */
JSXaalParserGP.renderCircleElement = function(viewer, circleNode) {
	var children = circleNode.childElements();
	var circle = new Graphic.Circle(viewer.renderer);
	JSXaal.Util.setID(circle, circleNode, viewer.id);
	JSXaalParserGP.handleStyle(viewer, circleNode, circle);
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'center') {
			var center = JSXaalParserGP.getCoordinate(viewer, child);
			circle.setCenter(center.x, center.y);
		} else if (child.nodeName.toLowerCase() == 'radius') {
			debug("radius " + child.hasAttribute("length"));
			circle.setRadius(Number(child.readAttribute("length")));
		}
	}
	debug("drawing circle "+circle.getID() +" "+ circle.getLocation().x +","+circle.getLocation().y+" r:"+circle.getRadius());
	return circle;
};
/**
 * Render's and returns a Graphic.Text object.
 * @function {public Graphic.Text} ?
 * @param {Object} viewer The viewer object that the shape should be drawn on.
 * @param {Object} textElement The textElement dom node object
 * @return {Graphic.Text} A Grahic.Text object corresponding to the given dom element.
 */
JSXaalParserGP.renderTextElement = function(viewer, textElement) {
	var children = textElement.childElements();
	var text = new Graphic.Text(viewer.renderer);
	JSXaal.Util.setID(text, textElement, viewer.id);
	JSXaalParserGP.handleStyle(viewer, textElement, text);
	for (var i = 0;i<children.length;i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'coordinate') {
            var coords = JSXaalParserGP.getCoordinate(viewer, child); 
            text.setLocation(coords.x, coords.y);
		}
	}
	var textContent = JSXaal.Util.getTextContents(textElement.getElementsByTagName("contents"), 
			viewer.settings.getLanguage());
	text.setTextValue(textContent);
	if (text.getFill() == 'none' && text.getStroke() == 'none') {
		text.setFill({r: 0, g: 0, b: 0, a: 0});
	}
	return text;
};
/**
 * A method that handles the rendering of the <code>&lt;student-annotation></code>
 * element.
 * @function {public void} ?
 * @param {Object} viewer
 * @param {Element} annoElement
 */
JSXaalParserGP.renderAnnotationElement = function(viewer, annoElement){
	var children = annoElement.childElements();
	for (var i = 0, len = children.length; i < len; i++) {
		try {
			var obj = viewer.parser.handleElement(children[i]);
			debug("anno:"+obj.getPoints());
			if (JSXaal.Util.isShapeObject(obj)) {
				viewer.renderer.add(obj);
			} else {
				debug("failed to render student annotations");					
			}					
		} catch (e) {
			debug("ERROR:" + e.name + " - " + e.message);
		}
	}
};

JSXaalParserGP.getCoordinate = function(viewer, coordElem) {
    var offset = coordElem.getElementsByTagName('offset');
    if (offset.length === 0) {
        return {x: Number(coordElem.readAttribute("x")), y: Number(coordElem.readAttribute("y"))};
    } else if (offset.length > 0) {
        offset = offset[0];
        var coords = JSXaalParserGP.getCoordinate(viewer, offset);
        var pos = JSXaalParserGP.getObjectCoordinate(viewer, offset.readAttribute("base-object"), offset.readAttribute("anchor"));
        return {x: Number(coordElem.readAttribute("x")) + coords.x + pos.x, y: Number(coordElem.readAttribute("y")) + coords.y + pos.y};
    }
    return {x: 0, y: 0};
};

JSXaalParserGP.getObjectCoordinate = function(viewer, baseObj, anchor) {
    var obj = viewer.dsStore.get(baseObj);
    if (obj) {
        obj = viewer.renderer.get(obj.getId() + viewer.id);
    } else {
    	obj = viewer.renderer.get(baseObj + viewer.id);
    }
    if (obj) {
    	anchor = anchor.toUpperCase();
    	var r = obj.getBounds();
        if (anchor == "NW") {
            return {"x": r.x, "y": r.y};
        } else if (anchor == "N") {
            return {"x": r.x + r.w/2, "y": r.y};
        } else if (anchor == "NE") {
            return {"x": r.x + r.w, "y": r.y};
        } else if (anchor == "E") {
            return {"x": r.x + r.w, "y": r.y + r.h/2};
        } else if (anchor == "SE") {
            return {"x": r.x + r.w, "y": r.y + r.h};
        } else if (anchor == "S") {
            return {"x": r.x + r.w/2, "y": r.y + r.h};
        } else if (anchor == "SW") {
            return {"x": r.x, "y": r.y + r.h};
        } else if (anchor == "W") {
            return {"x": r.x, "y": r.y + r.h/2};
        } else if (anchor == "C") {
            return {"x": r.x + r.w/2, "y": r.y + r.h/2};
        } else if (anchor == "CENTER" || anchor == "C") {
            return {"x": r.x + r.w/2, "y": r.y + r.h/2};
        } else {
            
        }
        return obj.getLocation();
    }
    return {x:0,y:0};
};
JSXaalParserGP.renderShapeElement = function(viewer, shapeNode) {
	var id = shapeNode.readAttribute("uses");
	var coord = {x:0, y:0};
	var children = shapeNode.childElements();
	for (var i=0; i<children.length; i++) {
		if (children[i].nodeName.toLowerCase() == 'coordinate') {
			coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
		} else if (children[i].nodeName.toLowerCase() == 'shape-scale') {
			var scale = Number(children[i].readAttribute('value'));
		}
	}
	if (!scale) {
		var scale = 1;
	}
	var shapes = viewer.shapes[id];
	for (i=0; i < shapes.length; i++) {
		shape = JSXaal.Util.useShapeObject(viewer, shapes[i], coord, scale);
		//viewer.renderer.add(shapes[i]);
	}
};