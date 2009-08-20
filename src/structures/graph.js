JSXaal.Graph = Class.create(JSXaal.Structure, {
	initialize: function($super, id) {
		$super(id);
		this.setName("Graph");
		this.nodes = new Hash();
	},
	addNode: function(node) {
		this.nodes.set(node.getId(), node);
	},
	removeNode: function(node) {
		if (this.nodes.get(node.getId())) {
			this.nodes.unset(node.getId());
		}
	},
	getNode: function(nodeId) {
		return this.nodes.get(nodeId);
	},
	addEdge: function(srcNode, targetNode, edge) {
		// TODO styling of edges
		this.nodes.get(srcNode.getId()).addSuccessor(targetNode, edge);
	},
	setCoordinateData: function(viewer, data) {
		$H(data['coordinates']).each(function(coord) {
			var node = this.getNode(coord.key);
			if (node) { 
				node.setPosition(parseInt(coord.value.x), parseInt(coord.value.y)); 
			}
		}.bind(this));
		this.draw(viewer);
	},
	_hasNodePositions: function() {
		var pos = true;
		this.nodes.each(function(node) {
			//if (id == 'graph5') {debug((node.value.getPosition().x===0)+","+(Number(node.value.getPosition().y)===0));}
			if (node.value.getPosition().x === 0 && node.value.getPosition().y === 0) {
				pos = false;
				return;
			}
		});
		return pos;
	},
	draw: function(viewer) {
		/*if (!this._hasNodePositions()) {
			JSXaalRenderer.util.getGraphLayout(viewer, this);
			return;
		}*/
		var x = this.getPosition().x;
		var y = this.getPosition().y;
		var group = new Graphic.Group(viewer.renderer);
		group.setID(this.id + viewer.id);
		var nodeGroup = new Graphic.Group(viewer.renderer);
		var maxX = 0, maxY = 0;
		this.nodes.each(function(pair) {
			JSXaalRenderer.renderNode(viewer.renderer, pair.value, nodeGroup);
			pair.value.successors.each(function(value) {
				JSXaalRenderer.renderEdge(pair.value, value.node, value.edge, nodeGroup);
				maxX = Math.max(maxX, value.node.getPosition().x);	
				maxY = Math.max(maxY, value.node.getPosition().y);	
			});		
		});
		nodeGroup.translate(x + 10, y + 20);
		JSXaalRenderer.drawFrame(x, y, maxX + 20 + NODESIZE, maxY + 30 + NODESIZE, viewer.renderer, group, this.getName());
		group.add(nodeGroup);
		if (viewer.settings.isSmoothAnimation()) {
			//group.setOpacity(0.01);
			viewer.renderer.add(group);
			//viewer.animator.addEffect(group.getID(), "XaalOpacity", "{from:0.01, to:255}");
		} else {
			viewer.renderer.add(group);			
		}
	}
});
JSXaal.GraphNode = Class.create(JSXaal.Node, {
	initialize: function($super) {
		$super();
		this.successors = [];
	},
	addSuccessor: function(node, edge) {
		this.successors.push({node: node, edge: edge});
	},
	getSuccessors: function() {
		return this.successors;
	}
});
