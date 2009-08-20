var NODESIZE = 40;
/**
 * @class JSXaal.Structure
 */
JSXaal.Structure = Class.create({
	initialize: function(id) {
		this.id = id;
		this.style = null;
	},
	getId: function() {
		return this.id;
	},
	setId: function(id) {
		this.id = id;
	},
	draw: function(viewer) {
		debug("Unimplemented method of JSXaal.Structure");
	},
	setStyle: function(style) {
		this.style = style;
	},
	getStyle: function() {
		return this.style;
	},
	setName: function(name) {
		this.name = name;
	},
	getName: function() {
		if (!this.name) { return this.id; }
		return this.name;
	},
	setProperty: function(name, value) {
		if (name == 'name') {
			this.setName(value);
		} else {
			if (!this.properties) {
				this.properties = new Hash();
			}
			this.properties.set(name, value);
		}
	},
	getProperty: function(name) {
		if (!this.properties) {
			return null;
		} else {
			return this.properties.get(name);
		}
	},
	hasProperty: function(name) {
		if (this.getProperty(name)) {
			return true;
		} else {
			return false;
		}
	},
	setPosition: function(x, y) {
		this.position = {x: Number(x), y: Number(y)};
		if (isNaN(this.position.x)) { this.position.x = 0; }
		if (isNaN(this.position.y)) { this.position.y = 0; }
	},
	getPosition: function() {
		return this.position || {x:0, y:0};
	}
});
JSXaal.Node = Class.create(JSXaal.Structure, {
	initialize: function($super, id) {
		this.data = null;
	},
	setData: function(data) {
		if (data instanceof JSXaal.Key) {
			this.data = data;
		} else {
			var key = new JSXaal.Key();
			key.setParent(this);
			key.setData(data);
			this.data = key;
		}
	},
	getData: function() {
		return this.data;
	},
	getDataItem: function() {
		return this.data.getData();
	},
	setParent: function(parent) {
		this.parent = parent;
	},
	getParent: function() {
		return this.parent;
	}
});
JSXaal.Edge = Class.create(JSXaal.Structure, {
	initialize: function($super, from, to) {
		$super(null);
		this.from = from;
		this.to = to;
		this.directed = false;
	},
	setLabel: function(label) {
		this.label = label;
	}, 
	getLabel: function() {
		return this.label || '';
	},
	isDirected: function() {
		return this.directed;
	},
	setDirected: function(directed) {
		this.directed = directed;
	},
	getFrom: function() {
		return this.from;
	},
	getTo: function() {
		return this.to;
	}
});
JSXaal.Key = Class.create(JSXaal.Structure, {
	initialize: function($super) {
		$super(null);
		this.data = null;
		this.parent = null;
	},
	setData: function(data) {
		this.data = data;
	},
	getData: function() {
		return this.data;
	},
	setParent: function(parent) {
		this.parent = parent;
	},
	getParent: function() {
		return this.parent;
	}
});
