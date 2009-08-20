/**
 * @class JSXaal.Array
 */
JSXaal.Array = Class.create(JSXaal.Structure, {
	/**
	 * @function {public void} ?
	 * @param {Object} $super A marker for Prototype to store the superclass constructor.
	 * 	This parameter is not part of the parameters you pass to the function. See <a href="http://prototypejs.org/api/class/create">http://prototypejs.org/api/class/create</a>.
	 * @param {Object} id
	 * 
	 */
	initialize: function($super, id) {
		$super(id);
		this.array = new Array();
		this.indexed = true;
		this.setName("Array");
	},
	setData: function(index, data) {
		if (!this.array[index]) {
			this.array[index] = new JSXaal.ArrayIndex();
		}
		this.array[index].setData(data);
	},
	getData: function(index) {
		if (!this.array[index]) {
			return "";
		}
		return this.array[index].getDataItem();
	},
	setIndexText: function(index, text) {
		this.array[index].setIndexText(text);
	},
	getIndexText: function(index) {
		if (!this.array[index]) { return String(index); }
		return this.array[index].getIndexText() || String(index);
	},
	setIndexed: function(value) {
		this.indexed = value;
	},
	isIndexed: function() {
		return (this.indexed == true);
	},
	getIndex: function(index) {
		return this.array[index];
	},
	setIndex: function(index, indexObj) {
		if (!indexObj || !(indexObj instanceof JSXaal.ArrayIndex)) {
			return;
		} else {
			this.array[index] = indexObj;
		}
	},
	setIndexStyle: function(index, style) {
		this.array[index].setStyle(style);
	},
	getIndexStyle: function(index) {
		return this.array[index].getStyle() || this.getStyle();
	},
	getSize: function() {
		return this.array.size();
	},
	/**
	 * This function draws this array using the renderer of the given viewer.
	 * @function {public void} ?
	 * @param {Object} viewer
	 * @see JSXaalViewer
	 */
	draw: function(viewer) {
		var textLength = 0;
		for (var index = 0; index < this.array.length; ++index) {
  			var item = this.getData(index);
			textLength += item.length;
  		}
		var group = new Graphic.Group(viewer.renderer);
		group.setID(this.getId() + viewer.id);
		var x = this.getPosition().x;
		var y = this.getPosition().y;
		var charWidth = 9;
		var width = charWidth*textLength+10*this.array.size()+60;
		var height = 100;
		if (!this.isIndexed()) {
			height -= NODESIZE/2.0;
		}
		var isFrame = this.hasProperty("draw-frame")?this.getProperty("draw-frame")!='false':true;
		if (isFrame) {
			JSXaalRenderer.drawFrame(x, y, width, height, viewer.renderer, group, this.getName());
		}
		var lengthCount = 0;
		for (var index = 0; index < this.array.length; ++index) {
			var indexGroup = group;
  			var item = this.getData(index);
			if (this.getIndex(index).getId()) {
				indexGroup = new Graphic.Group(viewer.renderer);
				indexGroup.setID(this.getIndex(index).getId() + viewer.id);
				group.add(indexGroup);
			}
			var itemLength = item.length;
			var text = new Graphic.Text(viewer.renderer);
			text.setLocation(x+index*10+charWidth*lengthCount+35, y + (isFrame?50:25));
			text.setTextValue(item);
			JSXaalRenderer.setKeyStyle(text, this.getIndex(index).getData().getStyle());
/*			text.setFill({r: 0, g: 0, b: 0, a: 0});
			text.setStroke({r: 0, g: 0, b: 0, a: 0});*/
			
			var left = x+30+index*10+charWidth*lengthCount;
			var indRect = new Graphic.Rectangle(viewer.renderer);
			indRect.setBounds(left, y+(isFrame?25:0), 10 + charWidth*itemLength, NODESIZE);
			JSXaalRenderer.setNodeStyle(indRect, this.getIndexStyle(index));
			indexGroup.add(indRect);
			indexGroup.add(text);
			// next draw the indices
			if (this.isIndexed()) {
				text = new Graphic.Text(viewer.renderer);
				var lengthDiff = itemLength - this.getIndexText(index).length;
				var t = lengthDiff;
				text.setLocation(x+index*10+charWidth*lengthCount+35 + 10*lengthDiff/2, y + 80);
				text.setTextValue(this.getIndexText(index));
				text.setFill({r: 0, g: 0, b: 0, a: 0});
				text.setStroke({r: 0, g: 0, b: 0, a: 0});
				indexGroup.add(text);
			}
			lengthCount += itemLength;
  		}

		viewer.renderer.add(group);
	}
});
JSXaal.ArrayIndex = Class.create(JSXaal.Node, {
	initialize: function($super) {
		$super();
	},
	setIndexText: function(text) {
		this.label = text;
	},
	getIndexText: function() {
		return this.label;
	}
});
