/**
 * Class offering utility methods for rendering parts of data structures, namely
 * structure "frames", nodes, and edges.
 * @class JSXaalRenderer
 */
var JSXaalRenderer = new Object();
JSXaalRenderer.counter = 0;
JSXaalRenderer.NODEGAP = 20;
JSXaalRenderer.renderNode = function(renderer, node, group) {
	var x = node.getPosition().x;
	var y = node.getPosition().y;
	var rect = new Graphic.Rectangle(renderer);
	rect.setID(group.getID() + "shape" + (JSXaalRenderer.counter++));
	rect.setBounds(x, y, NODESIZE, NODESIZE);
	JSXaalRenderer.setNodeStyle(rect, node.getStyle());
	group.add(rect);
	var text = new Graphic.Text(renderer);
	text.setID(group.getID() + "shape" + (JSXaalRenderer.counter++));
   	text.setFill({r: 0, g: 0, b: 0});
   	text.setStroke({r: 0, g: 0, b: 0});
	JSXaalRenderer.setKeyStyle(text, node.getData().getStyle());
   	text.setLocation(x-5+NODESIZE/2,Number(y)+5+NODESIZE/2);
	text.moveToFront();
	text.setTextValue(node.getData().getData());
	group.add(text);
};
JSXaalRenderer.drawFrame = function(x, y, width, height, renderer, group, title) {
	var bgRect = new Graphic.Rectangle(renderer);
	bgRect.setID("bgshape" + (JSXaalRenderer.counter++));
	bgRect.setBounds(x, y, width, height);
	bgRect.setFill({r: 223, g: 223, b: 223, a: 60});
	bgRect.setRoundCorner(5, 5);
	group.add(bgRect);
	var text = new Graphic.Text(renderer);
	text.setID("bgshape" + (JSXaalRenderer.counter++));
	text.setTextValue(title);
	text.setFont(12, "normal");
	text.setFill({r: 0, g: 0, b: 0});
	text.setStroke({r: 0, g: 0, b: 0});
	text.setLocation(x+5,y+15);
	group.add(text);
	var line = new Graphic.Line(renderer);
	line.setID("bgshape" + (JSXaalRenderer.counter++));
	line.setStroke({r: 0, g: 0, b: 0, w: 1.5});
	line.setPoints(x + 5, y+17, width + x - 5, y + 17);
	group.add(line);
};
/**
 * Applies the given style to the given shape. If no style is given, default
 * values specified in the JSXaal CSS will be used.
 * @function {public void} ?
 * @param {Object} shape
 * @param {Object} style
 */
JSXaalRenderer.setNodeStyle = function(shape, style) {
	shape.setFill({r: 128, g: 128, b: 128, a: 255});
	shape.setStroke({r: 0, g: 0, b: 0, w: 1.2});		
	shape.setRoundCorner(10, 10);
	JSXaalRenderer.util.setDefaultStyle(shape, "node");
	if (style) {
		JSXaalRenderer.setShapeStyle(shape, style);
	}
};
JSXaalRenderer.setShapeStyle = function(shape, style) {
	if (style && shape) {
		if (style.getColor()) {
			shape.setStroke(style.getColor());
		}
		if (style.getFillColor()) {
			shape.setFill(style.getFillColor());
		}
		if (style.getStrokeWidth()) {
			shape.setStrokeWidth(style.getStrokeWidth());
		}
	}
};
JSXaalRenderer.setKeyStyle = function(textShape, style) {
	textShape.setFill({r: 0, g: 0, b:0});
	if (textShape.setFont) {
		textShape.setFont(16, 'SansSerif');
	}
	if (style) {
		if (style.getColor() && style.getFillColor() && style.getColor() != style.getFillColor()) {
			textShape.setStroke(style.getColor());
			if (style.getFillColor()) {
				textShape.setFill(style.getFillColor());
			}
		} else if (!style.getColor() && style.getFillColor()) {
			textShape.setFill(style.getFillColor());
		} else {
			textShape.setFill(style.getColor());
		}
		var size = style.getFontSize() || 16;
		var family = style.getFontFamily() || 'SansSerif';
		var weight = style.getFontWeight();
		textShape.setFont(size, family, weight);
	}
};
JSXaalRenderer.renderEdge = function(from, to, edge, group) {
	var fromX = Number(from.getPosition().x);
	var fromY = Number(from.getPosition().y);
	var toX = Number(to.getPosition().x);
	var toY = Number(to.getPosition().y);
	var fromAngle = JSXaalRenderer.util.normalizeAngle(2*Math.PI -
                    Math.atan2(toY - fromY, toX - fromX));
    var toAngle = JSXaalRenderer.util.normalizeAngle(2*Math.PI -
                    Math.atan2(fromY - toY, fromX - toX));

    var fromPoint = JSXaalRenderer.util.getNodeBorderAtAngle(from, fromAngle);
    var toPoint = JSXaalRenderer.util.getNodeBorderAtAngle(to, toAngle);
	var line = new Graphic.Line(group.renderer);
	line.setID("jsxaaledge" + (JSXaalRenderer.counter++));
	JSXaalRenderer.util.setEdgeStyle(line, edge.getStyle());
   	line.setPoints(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
   	group.add(line);
	if (edge.isDirected()) {
		JSXaalRenderer.renderArrow(fromPoint, toPoint, "jsxaaledge"+(JSXaalRenderer.counter++),
				edge.getStyle(), group);
	}
};
JSXaalRenderer.renderArrow = function(fromPoint, toPoint, id, style, group) {
    var toAngle = JSXaalRenderer.util.normalizeAngle(2*Math.PI -
                    Math.atan2(fromPoint.y - toPoint.y, fromPoint.x - toPoint.x));
    var polyg = new Graphic.Polygon(group.renderer);
    polyg.setID(id);
	JSXaalRenderer.util.setEdgeStyle(polyg, style, true);
	polyg.addPoint(toPoint.x, toPoint.y);
	var angle = toAngle - Math.PI/6;
	var arrowSize = 4;
	polyg.addPoint(toPoint.x + (Math.cos(angle) * arrowSize), toPoint.y - (Math.sin(angle) * arrowSize));
	angle = toAngle + Math.PI/6;
	polyg.addPoint(toPoint.x + (Math.cos(angle) * arrowSize), toPoint.y - (Math.sin(angle) * arrowSize));
	group.add(polyg);
};
/**
 * Utility methods for the class JSXaalRenderer.
 * @class JSXaalRenderer.util
 * @see JSXaalRenderer
 */
JSXaalRenderer.util = new Object();
JSXaalRenderer.util.setEdgeStyle = function(shape, style, setfill) {
	shape.setStroke({r: 0, g: 0, b: 0, w: 1.2});
	JSXaalRenderer.setShapeStyle(shape, style);
};
/**
 * Function that sets the style of the shape to use the default values specified
 * in the CSS attached to the HTML document.<br/> 
 * 
 * The second (and any additional) parameter specifies the css classes used when
 * selecting the values. The structureType should specify the type of the structure.
 * This value is used in the CSS classname. For example, giving structureType value
 * <em>node</em> will use CSS class <code>jsxaal-node</code>.<br/>
 * 
 * The properties that are currently used are:
 * <ol>
 *  <li><code>color</code> that sets the stroke of the shape</li> 
 *  <li><code>background-color</code> that sets the fill of the shape</li>
 * </ol> 
 * @function {public void} ?
 * @param {Graphic.Shape} shape
 * @param {Object...} structureType
 */
JSXaalRenderer.util.setDefaultStyle = function(shape, structureType) {
	var cssRule = ".jsxaal-" + structureType;
	for (var i=2; i<arguments.length; i++) {
		cssRule += " .jsxaal-" + arguments[i];
	};
	var node = $$(cssRule);
	var elem = null;
	if (node.length == 0) {
		elem = new Element('div', {style: 'display:none'});
		for (var i=1; i<arguments.length; i++) {
			elem.addClassName('jsxaal-'+arguments[i]);
		}
		$$('body')[0].appendChild(elem);
	} else {
		elem = node[0];
	}
	shape.setStroke(JSXaal.Util.colorstringToHash(Element.getStyle(elem, 'color')));
	shape.setFill(JSXaal.Util.colorstringToHash(Element.getStyle(elem, 'background-color')));
};
JSXaalRenderer.util.normalizeAngle = function(angle) {
	while (angle < 0)
            angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI)
            angle -= 2 * Math.PI;
        return angle;
};
JSXaalRenderer.util.getNodeBorderAtAngle = function(node, angle) {
	var b = {x: node.getPosition().x, y: node.getPosition().y, width: NODESIZE, height: NODESIZE};
	var c = {x: b.x + NODESIZE/2, y: b.y + NODESIZE/2};
        var x, y;
        var urCornerA = Math.atan2(b.height, b.width);
        var ulCornerA = Math.PI - urCornerA;
        var lrCornerA = 2*Math.PI - urCornerA;
        var llCornerA = urCornerA + Math.PI;

        if (angle < urCornerA || angle > lrCornerA) { // on right side
            x = b.x + b.width;
            y = c.y - (b.width/2.0) * Math.tan(angle);
        } else if (angle > ulCornerA && angle < llCornerA) { // left
            x = b.x;
            y = c.y + (b.width/2.0) * Math.tan(angle - Math.PI);
        } else if (angle <= ulCornerA) { // top
            x = c.x + (b.height/2.0) / Math.tan(angle);
            y = b.y;
        } else { // on bottom side
            x = c.x - (b.height/2.0) / Math.tan(angle - Math.PI);
            y = b.y + b.height;
        }
	return {x: Math.round(x), y: Math.round(y)};
};
JSXaalRenderer.util.getGraphLayout = function(viewer, graph) {
	var graphStr = '';
	graph.nodes.each(function(item) {
		item.value.successors.each(function(succ) {
			graphStr += item.key + '-' + succ.node.getId() + ",";
		});
	});
	debug(graphStr);
	debug(graphStr.escapeHTML());
	debug(encodeURIComponent(graphStr));
	JSXaalRenderer.util.getJSON('http://gd.villekaravirta.com/draw/?graph=' +
			encodeURIComponent(graphStr) + 'a-b%2Cb-c&key=demo&jsoncallback=?', 
			graph.setCoordinateData.bind(graph, viewer), graph.getId());//function(data) {debug(data['coordinates']['a'].x);});
};
(function(){
	  var id = 0, head = $$('head')[0], global = this;
	  JSXaalRenderer.util.getJSON = function(url, callback, graphId) {
	    var script = document.createElement('script'), token = '__jsoncallback' + id;
	    
	    // callback should be a global function
	    global[token] = callback;
	    
	    // url should have "?" parameter which is to be replaced with a global callback name
	    script.src = url.replace(/\?(&|$)/, '__jsoncallback' + id + '$1');
	    // clean up on load: remove script tag, null script variable and delete global callback function
	    script.onload = function() {
	      script.remove();
	      script = null;
	      delete global[token];
	    };
	    head.appendChild(script);
	    id++;
	  }
	})();