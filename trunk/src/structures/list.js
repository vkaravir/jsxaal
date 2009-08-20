/**
 * @class JSXaal.List 
 */
JSXaal.List = Class.create(JSXaal.Structure, {
	initialize: function($super, id) {
		$super(id);
		this.setName("LinkedList");
		this.head = null;
	},
	getHead: function() {
		return this.head;
	},
	setHead: function(listnode) {
		this.head = listnode;
	},
	draw: function(viewer) {
		// TODO: orientation of lists
		var group = new Graphic.Group(viewer.renderer);
		group.setID(this.getId() + viewer.id);
		var x = this.getPosition().x;
		var y = this.getPosition().y;
		var charWidth = 9;
		var textLength = 4;
		var width = charWidth*textLength+50*this.size()+60;
		var height = 75;
		JSXaalRenderer.drawFrame(x, y, width, height, viewer.renderer, group, this.getName());
		var curr = this.getHead();
		var left = -15;
		var prev;
		while (curr) {
			var itemLength = curr.getData().getData().length;
			var padding = 0;
			var nodeWidth = charWidth*itemLength + 10;
			if (nodeWidth < NODESIZE) {
				padding = (NODESIZE - nodeWidth)/2;
				nodeWidth = NODESIZE;
			}
			left += 30;
			curr.setPosition(x+left, y+25);
			JSXaalRenderer.renderNode(viewer.renderer, curr, group);
			left += nodeWidth;
			if (prev) {
				var edge = new JSXaal.Edge(prev, curr);
				edge.setStyle(prev.getNextStyle());
				edge.setDirected(true);
				JSXaalRenderer.renderEdge(prev, curr, edge, group);
			}
			prev = curr;
			curr = curr.getNext();
		}
		viewer.renderer.add(group);
	},
	size: function() {
		if (!this.getHead()) { return 0;}
		else {
			var count = 1;
			var curr = this.getHead();
			while (curr.hasNext()) {
				curr = curr.getNext();
				count++;
			}
			return count;
		}
	}
});
JSXaal.ListNode = Class.create(JSXaal.Node, {
	initialize: function($super) {
		$super();
	},
	setNext: function(value, style) {
		if (value instanceof JSXaal.ListNode) {
			this.next = value;
		} else {
			var node = new JSXaal.ListNode();
			node.setData(value);
			this.next = node;
		}
		this.nextStyle = style;
	},
	getNext: function() {
		return this.next;
	},
	hasNext: function() {
		return Boolean(this.next);
	},
	getNextStyle: function() {
		return this.nextStyle;
	}
});
