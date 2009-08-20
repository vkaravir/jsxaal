/**
 * @class JSXaalParserAnim
 */
var JSXaalParserAnim = new Object();
JSXaalParserAnim.register = function(parser) {
	parser.registerElementHandlerFunction("par", JSXaalParserAnim.renderParElement);
	parser.registerElementHandlerFunction("seq", JSXaalParserAnim.renderSeqElement);
	parser.registerElementHandlerFunction("hide", JSXaalParserAnim.renderHideElement);
	parser.registerElementHandlerFunction("create", JSXaalParserAnim.renderCreateElement);
	parser.registerElementHandlerFunction("swap", JSXaalParserAnim.renderSwapElement);
	parser.registerElementHandlerFunction("move", JSXaalParserAnim.renderMoveElement);
	parser.registerElementHandlerFunction("scale", JSXaalParserAnim.renderScaleElement);
	parser.registerElementHandlerFunction("rotate", JSXaalParserAnim.renderRotateElement);
	parser.registerElementHandlerFunction("change-style", JSXaalParserAnim.renderChangeStyleElement);
};
JSXaalParserAnim.renderParElement = function(viewer, parNode){
	if (viewer.settings.isSmoothAnimation()) {
		viewer.animator.addEffect("startpar");		
	}
	parNode.childElements().each(
		function(item) {
			viewer.parser.handleElement(item);
		}
	);
	if (viewer.settings.isSmoothAnimation()) {
		viewer.animator.addEffect("endpar");
	}
};
JSXaalParserAnim.renderSeqElement = function(viewer, seqNode) {
	seqNode.childElements().each(
		function(item) {
			viewer.parser.handleElement(item);
		}
	);
};
JSXaalParserAnim.renderHideElement = function(viewer, hideNode) {
	var type = hideNode.readAttribute("type");
	if (!type) {
		type = "selected";
	}
	if (type == 'all') {
		var shapes = viewer.renderer.shapes();
		for (var i=0; i<shapes.size(); i++) {
			var shape = shapes[i];
			if (viewer.settings.isSmoothAnimation()) {
				if (shape.getStrokeOpacity() > 0.01 || shape.getFillOpacity() > 0.01)
					viewer.animator.addEffect(shape.getID(), "XaalOpacity", "{from:"+(shape.getStrokeOpacity()*255) + ", to:0.001}");
			} else {
				viewer.renderer.remove(shape);				
			}
		}		
	} else if (type == 'selected') {
		var shapes = hideNode.getElementsByTagName("object-ref");
		for (var i=0; i<shapes.length; i++) {
			var id = shapes[i].readAttribute('id') + viewer.id;
			var shape = viewer.renderer.get(id);
			if (viewer.settings.isSmoothAnimation()) {
				viewer.animator.addEffect(shape.getID(), "XaalOpacity", "{from:"+(shape.getStrokeOpacity()*255) + ", to:0.001}");
			} else {
				viewer.renderer.remove(shape);		
			}
		}		
	}
};
JSXaalParserAnim.renderCreateElement = function(viewer, createNode) {
	var children = createNode.childElements();
	for (var i = 0; i < children.length; i++) { 
		var shape = viewer.parser.handleElement(children[i]);
		if (JSXaal.Util.isShapeObject(shape)) {
			if (viewer.settings.isSmoothAnimation()) {
				var oldOpacity = shape.getStrokeOpacity();
				shape.setStrokeOpacity(0.01);
				shape.setFillOpacity(0.01);
				viewer.animator.addEffect(shape.getID(), "XaalOpacity", "{from:"+(shape.getStrokeOpacity()*255) + ", to:" + (oldOpacity*255) + "}");
			}
			viewer.renderer.add(shape);				
		}
	}
};
JSXaalParserAnim.renderMoveElement = function(viewer, moveNode) {
	var children = moveNode.childElements();
	var coord = moveNode.getElementsByTagName("coordinate")[0];
	var refs = moveNode.getElementsByTagName("object-ref");
	for (var i = 0; i < refs.length ; i++) {
		var id = refs[i].readAttribute("id") + viewer.id;
		if (id) {
			if (viewer.settings.isSmoothAnimation()) {
				viewer.animator.addEffect(id, "XaalMove", "{x:"+Number(coord.readAttribute("x")) + ", y:" + Number(coord.readAttribute("y")) + "}");
			} else {
				var shape = viewer.renderer.get(id);
				shape.translate(Number(coord.readAttribute("x")), Number(coord.readAttribute("y")));
			}
		}
	}
};
JSXaalParserAnim.renderScaleElement = function(viewer, scaleNode) {
	var targets = scaleNode.getElementsByTagName("object-ref");
	for (var i=0; i<targets.length; i++) {
		var id = targets[i].readAttribute("id") + viewer.id;
		var scale = Number(scaleNode.readAttribute("scale"));
		if (viewer.settings.isSmoothAnimation()) {
			viewer.animator.addEffect(id, "XaalScale", "{scaleTo:"+scale+ "}");
		} else {
			var elem = viewer.renderer.get(id);
			var bounds = elem.getBounds();
    			var cx = bounds.x + bounds.w/2.0;
    			var cy = bounds.y + bounds.h/2.0;
			elem.scale(scale, scale, cx, cy);
		}
	}
};
JSXaalParserAnim.renderRotateElement = function(viewer, rotateNode) {
	var degree = Number(rotateNode.readAttribute("degree"));
	var refs = rotateNode.getElementsByTagName("object-ref");
	for (var i = 0; i < refs.length ; i++) {
		var id = refs[i].readAttribute("id") + viewer.id;
		if (id) {
			if (viewer.settings.isSmoothAnimation()) {
				viewer.animator.addEffect(id, "XaalRotate", "{degree:" + degree + "}");
				debug(id + viewer.renderer.get(id));
			} else {
				viewer.renderer.get(id).rotate(degree);
			}
		}
	}
};
JSXaalParserAnim.renderChangeStyleElement = function(viewer, node) {
	var style = node.getElementsByTagName("x-style")[0];
	var styleRules = style.childElements();
	var styleString = "";
	var color, fillColor;
	var nodeCount = 0;
	var i = 0;	
	for (; i < styleRules.length; i++) {
		if (styleRules[i].nodeName.toLowerCase() == "color") {
			if (nodeCount >0) { styleString += ',';}
			styleString += "color:'" + JSXaal.Util.colorToString(styleRules[i]) + "'";
			color = JSXaal.Util.convertColor(styleRules[i]);
			nodeCount++;
		} else if (styleRules[i].nodeName.toLowerCase() == "fill-color") {
			if (nodeCount >0) { styleString += ',';}
			styleString += "fillcolor:'" + JSXaal.Util.colorToString(styleRules[i]) + "'";
			fillColor = JSXaal.Util.convertColor(styleRules[i]);
			nodeCount++;
		}
	}
	var newStyle = JSXaalParserGP.parseStyle(style, viewer);
	var redraw = [];
	var refs = node.getElementsByTagName("object-ref");
	for (i = 0; i < refs.length; i++) {
		var id = refs[i].readAttribute("id");
		if (id) {
			var str = viewer.dsStore.get(id);
			if (str) {
				if (str instanceof JSXaal.Structure) {
					str.setStyle(newStyle);
					redraw.push(str.getId());
				} else if (str instanceof JSXaal.Node) {
					var parent = viewer.dsStore.get(str.getParent().getId()); 
					if (newStyle && parent) {
						str.setStyle(newStyle);
						redraw.push(parent.getId());
					}
				}	
			} else {
				var obj = viewer.renderer.get(id + viewer.id);
				if (obj && JSXaal.Util.isShapeObject(obj)) {
					if (viewer.settings.isSmoothAnimation()) {
						viewer.animator.addEffect(id + viewer.id, "XaalMorph", "{style:{"+styleString + "}}");
					} else {
						if (color) {
							obj.setStroke(color);
						}
						if (fillColor) {
							obj.setFill(fillColor);
						}
					}
				} else if (obj instanceof Graphic.Group) {
					debug("group changing style..");
					viewer.renderer.remove(obj);
				}
			}
		}
	}
	redraw.uniq().each(function(item) {
		viewer.renderer.remove(viewer.renderer.get(item + viewer.id));
		viewer.dsStore.get(item).draw(viewer);
	});
};
JSXaalParserAnim.renderSwapElement = function(viewer, swapNode) {
	var swap = viewer.dsStore.get(swapNode.readAttribute("swap"));
	var sWith = viewer.dsStore.get(swapNode.readAttribute("with"));
	if (swap instanceof JSXaal.Key && sWith instanceof JSXaal.Key) {
		var sPar = swap.getParent();
		var wPar = sWith.getParent();
		sPar.setData(sWith);
		wPar.setData(swap);
		while (!(sPar instanceof JSXaal.Structure)) {
			sPar = sPar.getParent();
		}
		while (!(wPar instanceof JSXaal.Structure)) {
			wPar = wPar.getParent();
		}
		viewer.renderer.remove(viewer.renderer.get(sPar.getId() + viewer.id));
		sPar.draw(viewer);
		if (sPar != wPar) {
			debug("..and again");
			viewer.renderer.remove(viewer.renderer.get(wPar.getId() + viewer.id));
			wPar.draw(viewer);
		}
	}
	debug("swap "+swap+" with "+sWith);
};
JSXaalParserAnim.renderSwapIdElement = function(viewer, xmlNode) {
	var swap = viewer.dsStore.get(swapNode.readAttribute("swap"));
	var sWith = viewer.dsStore.get(swapNode.readAttribute("with"));
	var temp = swap.getId();
	swap.setId(sWith.getId());
	viewer.dsStore.set(sWith.getId(), swap);
	sWith.setId(temp);
	viewer.dsStore.set(temp, sWith);
};