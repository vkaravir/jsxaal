/**
 * @class JSXaalParserDS
 */
var JSXaalParserDS = new Object();	
JSXaalParserDS.register = function(parser) {
	parser.registerElementHandlerFunction("tree", JSXaalParserDS.renderTreeElement);
	parser.registerElementHandlerFunction("bintree", JSXaalParserDS.renderBinTreeElement);
	parser.registerElementHandlerFunction("bst", JSXaalParserDS.renderBstElement);
	parser.registerElementHandlerFunction("graph", JSXaalParserDS.renderGraphElement);
	parser.registerElementHandlerFunction("array", JSXaalParserDS.renderArrayElement);
	parser.registerElementHandlerFunction("list", JSXaalParserDS.renderListElement);
	parser.registerElementHandlerFunction("insert", JSXaalParserDS.renderInsertElement);
	parser.registerElementHandlerFunction("key", JSXaalParserDS.renderKeyElement);
};
JSXaalParserDS.renderTreeElement = function(viewer, treeNode) {
		var id = JSXaalParserDS.getId(treeNode);
		var rootId = treeNode.readAttribute("root");
		if (!rootId) {
			return;
		}
		var edges = new Array();
		var children = treeNode.childElements();
		var tree = new JSXaal.Tree(id);
		JSXaalParserDS.setStructureProperties(tree, treeNode);
		viewer.dsStore.set(id, tree);
		for (var i=0;i<children.length;i++) {
			if (children[i].nodeName.toLowerCase() == 'node') {
				JSXaalParserDS.parseNodeElement(viewer, children[i], new JSXaal.TreeNode());
			} else if (children[i].nodeName.toLowerCase() == 'edge'){
				edges.push(children[i]);
			} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
				var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
				tree.setPosition(coord.x, coord.y);
			}
		}
		tree.setRoot(viewer.dsStore.get(rootId));
		edges.each(function(edge) {
			var fromNode = viewer.dsStore.get(edge.readAttribute("from"));
			var toNode = viewer.dsStore.get(edge.readAttribute("to"));
			fromNode.addChild(toNode);
		});
		tree.draw(viewer);
	};
JSXaalParserDS.renderBinTreeElement = function(viewer, treeNode) {
		var id = JSXaalParserDS.getId(treeNode);
		var rootId = treeNode.readAttribute("root");
		if (!rootId) {
			return;
		}
		var edges = new Array();
		var children = treeNode.childElements();
		var tree = new JSXaal.BinTree(id);
		JSXaalParserDS.setStructureProperties(tree, treeNode);
		viewer.dsStore.set(id, tree);
		for (var i=0;i<children.length;i++) {
			if (children[i].nodeName.toLowerCase() == 'node') {
				JSXaalParserDS.parseNodeElement(viewer, children[i], new JSXaal.BinTreeNode());
			} else if (children[i].nodeName.toLowerCase() == 'edge'){
				edges.push(children[i]);
			} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
				var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
				tree.setPosition(coord.x, coord.y);
			}
		}
		tree.setRoot(viewer.dsStore.get(rootId));
		edges.each(function(edge) {
			var fromNode = viewer.dsStore.get(edge.readAttribute("from"));
			var toNode = viewer.dsStore.get(edge.readAttribute("to"));
			var child = edge.readAttribute("child");
			if (child && child.toLowerCase() == "left") {
				fromNode.setLeft(toNode);
			} else {
				fromNode.setRight(toNode);
			}
		});
		tree.draw(viewer);
	};
JSXaalParserDS.renderBstElement = function(viewer, treeNode) {
		var id = JSXaalParserDS.getId(treeNode);
		var rootId = treeNode.readAttribute("root");
		if (!rootId) {
			return;
		}
		var edges = new Array();
		var children = treeNode.childElements();
		var tree = new JSXaal.BinSearchTree(id);
		JSXaalParserDS.setStructureProperties(tree, treeNode);
		viewer.dsStore.set(id, tree);
		for (var i=0;i<children.length;i++) {
			if (children[i].nodeName.toLowerCase() == 'node') {
				JSXaalParserDS.parseNodeElement(viewer, children[i], new JSXaal.BinSearchTreeNode());
			} else if (children[i].nodeName.toLowerCase() == 'edge'){
				edges.push(children[i]);
			} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
				var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
				tree.setPosition(coord.x, coord.y);
			}
		}
		tree.setRoot(viewer.dsStore.get(rootId));
		edges.each(function(edge) {
			var fromNode = viewer.dsStore.get(edge.readAttribute("from"));
			var toNode = viewer.dsStore.get(edge.readAttribute("to"));
			var child = edge.readAttribute("child");
			if (child && child.toLowerCase() == "left") {
				fromNode.setLeft(toNode);
			} else {
				fromNode.setRight(toNode);
			}
		});
		tree.draw(viewer);
	};
JSXaalParserDS.renderInsertElement = function(viewer, insertNode) {
	var str = viewer.dsStore.get(insertNode.readAttribute("target"));
	if (!str){ 
		debug("no structure to insert to");
		return;
	} else if (!str.insert) {
		debug("no insert function in the structure");
		return;
	}
	var children = insertNode.childElements();
	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeName.toLowerCase() == 'key') {
			str.insert(children[i].readAttribute("value"));	
		}
	}
	str.draw(viewer);
};
JSXaalParserDS.renderGraphElement = function(viewer, graphNode) {
	var children = graphNode.childElements();
	var id = JSXaalParserDS.getId(graphNode);
	var graph = new JSXaal.Graph(id);
	JSXaalParserDS.setStructureProperties(graph, graphNode);
	viewer.dsStore.set(id, graph);
	for (var i=0;i<children.length;i++) {
		if (children[i].nodeName.toLowerCase() == 'node') {
			var node = new JSXaal.GraphNode();
			JSXaalParserDS.parseNodeElement(viewer, children[i], node);
			graph.addNode(node);
		} else if (children[i].nodeName.toLowerCase() == 'edge'){
			var edgeId = JSXaalParserDS.getId(children[i]);
			var edgeNode = children[i];
			var from = viewer.dsStore.get(edgeNode.readAttribute("from"));
			var to = viewer.dsStore.get(edgeNode.readAttribute("to"));
			var edge = new JSXaal.Edge(from, to);
			if (edgeNode.hasAttribute("directed")) {
				edge.setDirected("true" == edgeNode.readAttribute("directed").toLowerCase());
			}
			if (edgeId) {
				edge.setId(edgeId);
				viewer.dsStore.set(edgeId, edge);
			}
			if (edgeNode.readAttribute("label")) {
				edge.setLabel(edgeNode.readAttribute("label"));
			}
			var style = JSXaalParserDS.handleStyle(viewer, edgeNode);
			if (style) {
				edge.setStyle(style); 
			}

			graph.addEdge(from, to, edge);
		} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
			var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
			graph.setPosition(coord.x, coord.y);
		}
	}
	graph.draw(viewer);
};
JSXaalParserDS.renderListElement = function(viewer, listNode) {
	var children = listNode.childElements();
	var id = JSXaalParserDS.getId(listNode);
	var list = new JSXaal.List(id);
	JSXaalParserDS.setStructureProperties(list, listNode);
	viewer.dsStore.set(id, list);
	for (var i=0;i<children.length;i++) {
		if (children[i].nodeName.toLowerCase() == 'node') {
			var node = new JSXaal.ListNode();
			JSXaalParserDS.parseNodeElement(viewer, children[i], node);
			if (!list.getHead()) {
				list.setHead(node);
			}
		} else if (children[i].nodeName.toLowerCase() == 'edge'){
			var edgeNode = children[i];
			var from = viewer.dsStore.get(edgeNode.readAttribute("from"));
			var to = viewer.dsStore.get(edgeNode.readAttribute("to"));
			var style = JSXaalParserDS.handleStyle(viewer, edgeNode);
			from.setNext(to, style);
		} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
			var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
			list.setPosition(coord.x, coord.y);
		}
	}
	list.draw(viewer);
};
JSXaalParserDS.parseNodeElement = function(viewer, node, nodeObj) {
	nodeObj.setId(JSXaalParserDS.getId(node));
	var data = viewer.parser.handleElement(node.getElementsByTagName("key")[0]);
	nodeObj.setData(data);
	var coord = node.getElementsByTagName("coordinate")[0];
	if (coord) {
		nodeObj.setPosition(coord.readAttribute("x"), coord.readAttribute("y"));
	}
	var style = JSXaalParserDS.handleStyle(viewer, node);
	if (style) {
		nodeObj.setStyle(style); 
	}
	viewer.dsStore.set(nodeObj.getId(), nodeObj);
};
/**
 * @function {private static void} ?
 * @param {Object} viewer
 * @param {Object} arrayNode
 */
JSXaalParserDS.renderArrayElement = function(viewer, arrayNode) {
	var children = arrayNode.childElements();
	var id = JSXaalParserDS.getId(arrayNode);
	var array = new JSXaal.Array(id);
	JSXaalParserDS.setStructureProperties(array, arrayNode);
	viewer.dsStore.set(id, array);
	if (arrayNode.readAttribute("indexed") && arrayNode.readAttribute("indexed") == "false") {
		array.setIndexed(false);
	}
	var style = JSXaalParserDS.handleStyle(viewer, arrayNode);
	if (style) {
		array.setStyle(style);
	}
	for (var i = 0; i < children.length; i++) {
		if (children[i].nodeName.toLowerCase() == 'index') {
			var ind = children[i];
			var indexNum = array.getSize();
			if (ind.readAttribute("index")) {
				indexNum = Number(ind.readAttribute("index"));
			}
			var data = viewer.parser.handleElement(ind.getElementsByTagName("key")[0]);
			array.setData(indexNum, data);
			if (ind.readAttribute("label")) {
				array.setIndexText(indexNum, ind.readAttribute("label"));
			}
			style = JSXaalParserDS.handleStyle(viewer, ind);
			if (style) {
				array.setIndexStyle(indexNum, style);
			}
			var indexObj = array.getIndex(indexNum);
			data.setParent(indexObj);
			id = ind.readAttribute("id");
			if (id) {
				indexObj.setId(id);
				viewer.dsStore.set(id, indexObj);
				indexObj.setParent(array);
			}
		} else if (children[i].nodeName.toLowerCase() == 'coordinate') {
			var coord = JSXaalParserGP.getCoordinate(viewer, children[i]);
			array.setPosition(coord.x, coord.y);
		}
	}
	array.draw(viewer);
};
JSXaalParserDS.setStructureProperties = function(str, node) {
	var strProperties = node.getElementsByTagName("structure-property");
	for (var i=0; i < strProperties.length; i++) {
		str.setProperty(strProperties[i].readAttribute("name"), strProperties[i].readAttribute("value"));
	}
};
JSXaalParserDS.getId = function(node) {
	var id = node.readAttribute("id");
	if (!id) {
		id = node.nodeName + JSXaal.Util.shapeCounter++;
	}
	return id;
};
JSXaalParserDS.handleStyle = function(viewer, xmlNode) {
	var styleId = xmlNode.readAttribute("x-style");
	if (styleId) {
		return viewer.styleStore[styleId];
	} else {
		var styles = xmlNode.getElementsByTagName("x-style");
		for (var i=0; i< styles.length; i++) {
			var style = styles[i];
			if (style && style.up() == xmlNode) {
				return JSXaalParserGP.parseStyle(style, viewer);
			}
		}
	}
};
JSXaalParserDS.renderKeyElement = function(viewer, keyNode) {
	if (keyNode.hasAttribute("value")) {
		data = keyNode.readAttribute("value");
	} else {
		data = JSXaal.Util.getContentsAsText(keyNode);
	}
	var key = new JSXaal.Key();
	key.setId(JSXaalParserDS.getId(keyNode));
	viewer.dsStore.set(key.getId(), key);
	key.setData(data);
	var style = JSXaalParserDS.handleStyle(viewer, keyNode);
	if (style) {
		key.setStyle(style);
	}
	return key;
};
