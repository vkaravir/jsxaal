/**
 * @class JSXaal.Tree 
 */
JSXaal.Tree = Class.create(JSXaal.Structure, {
	initialize: function($super, id) {
		$super(id);
		this.setName("Tree");
	},
	getRoot: function() {
		return this.root;
	},
	setRoot: function(node) {
		this.root = node;
	},
	draw: function(viewer) {
		var x = this.getPosition().x;
		var y = this.getPosition().y;
        this.getRoot().calculateLayout();
		this.getRoot().calculateFinalLayout(-NODESIZE/2, 10+JSXaalRenderer.NODEGAP);
		var group = new Graphic.Group(viewer.renderer);
		group.setID(this.id + viewer.id);
		var nodeGroup = new Graphic.Group(viewer.renderer);
		this.getRoot().draw(viewer, nodeGroup);
		var dsSize = nodeGroup.getSize();
		var width = dsSize.w + 2*JSXaalRenderer.NODEGAP;
		var height = dsSize.h + 2*JSXaalRenderer.NODEGAP;
		var isFrame = this.hasProperty("draw-frame")?this.getProperty("draw-frame")!='false':true;
		if (isFrame) {
			JSXaalRenderer.drawFrame(x, y, width, height, viewer.renderer, group, this.getName());
		}
		group.add(nodeGroup);
		var dx = JSXaalRenderer.NODEGAP - nodeGroup.getLocation().x;
		nodeGroup.translate(x + dx, y);
		viewer.renderer.add(group);
	}
});
/**
 * @class JSXaal.TreeNode 
 */
JSXaal.TreeNode = Class.create(JSXaal.Node, {
	initialize: function($super) {
		$super();
		this.children = new Array();
	},
	addChild: function(toNode) {
		this.children[this.children.size()] = toNode;
	},
	getChildren: function() {
		return this.children;
	},
	calculateFinalLayout: function(dx, dy) {
	        if (-this.contours.getLeftExtent() - this.getXTranslation() > 0) {
			this.translate(-this.contours.getLeftExtent() - this.getXTranslation(), 0);
		}
		this.translateNodes(dx, dy);
		this.propagateTranslations();
	},
	calculateLayout: function() {
		var ch = this.getChildren();
		for (var i = 0; i < ch.length; i++) {
			if (ch[i]) {
				ch[i].calculateLayout();
			} else {
				//debug("child is null!!");
			}
		}
		this.cachedTranslation = {width: 0, height: 0};
		this.translation = {width: 0, height: 0};
		this.calculateContours();
	},
	calculateContours: function() {
		var vtcSize = {width: NODESIZE, height: NODESIZE};
        var children = this.getChildren();
        var rootLeft = -vtcSize.width / 2;
		var rootRight = vtcSize.width / 2 + (vtcSize.width % 2 === 0 ? 0 : 1);
		var rootHeight = vtcSize.height;
		if (children.length === 0) {
			this.contours = new JSXaal.Tree.TreeContours(rootLeft, rootRight, rootHeight, this.getData().getData());
			this.translateThisNode(-rootLeft, 0);
		} else {
			var transSum = 0;
			var firstChild = children[0];
			this.contours = firstChild.contours;
			firstChild.contours = null;
			firstChild.translateNodes(0, JSXaalRenderer.NODEGAP + rootHeight);

			for (var i = 1; i < children.length; i++) {
				var child = children[i];
				var childC = child.contours;
				var trans = this.contours.calcTranslation(childC, JSXaalRenderer.NODEGAP);
				transSum += trans;

				child.contours = null;
				this.contours.joinWith(childC, trans);
	
				child.translateNodes(firstChild.getXTranslation() + trans - child.getXTranslation(),
                                	JSXaalRenderer.NODEGAP + rootHeight);
			}

			var rootTrans = transSum / children.length;
			this.contours.addOnTop(rootLeft, rootRight, rootHeight, JSXaalRenderer.NODEGAP, rootTrans);
			this.translateThisNode(firstChild.getXTranslation() + rootTrans, 0);
		}
	},
	translateThisNode: function(x, y) {
		this.translation.width += x;
		this.translation.height += y;
	},
	translateAllNodes: function(howMuch) {
		if (!this.cachedTranslation) {
			this.cachedTranslation = {width: 0, height: 0};
		}
		this.cachedTranslation.width += howMuch.width;
		this.cachedTranslation.height += howMuch.height;
	},
	translateNodes: function(x, y) {
		this.translateAllNodes({width: x, height: y});
	},
	getXTranslation: function() {
		return this.translation.width +
			((!this.cachedTranslation) ? 0 : this.cachedTranslation.width);
	},
	propagateTranslations: function() {
		if (this.cachedTranslation) {
			var ch = this.getChildren();
			for (var i = 0; i < ch.size(); i++) {
				var child = ch[i];
				child.translateAllNodes(this.cachedTranslation);
				child.propagateTranslations();
			}
			this.translation.width += this.cachedTranslation.width;
			this.translation.height += this.cachedTranslation.height;
			this.cachedTranslation = null;
		}
	},
	draw: function(viewer, group) {
		if (!this.getPosition() || (this.getPosition().x === 0 && this.getPosition().y === 0)) {
			this.setPosition(this.translation.width, this.translation.height);
		}
		JSXaalRenderer.renderNode(viewer.renderer, this, group);
		for (var index = 0, len = this.getChildren().length; index < len; ++index) {
			var item = this.getChildren()[index];
			if (!(item instanceof JSXaal.TreeNode.DUMMYNODE)) {
				item.draw(viewer, group);
				JSXaalRenderer.renderEdge(this, item, new JSXaal.Edge(), group);
			}
		}
	}
});
/**
 * @class JSXaal.BinTree 
 */
JSXaal.BinTree = Class.create(JSXaal.Tree, {
	initialize: function($super, id) {
		$super(id);
		this.setName("Binary Tree");
	}
});
/**
 * @class JSXaal.BinTreeNode 
 */
JSXaal.BinTreeNode = Class.create(JSXaal.TreeNode, {
	initialize: function($super) {
		$super();
		this.children[0] = null;//new JSXaal.TreeNode.DUMMYNODE();
		this.children[1] = null;//new JSXaal.TreeNode.DUMMYNODE();
	},
	setLeft: function(node) {
		this.children[0] = node;
		if (!this.children[1]) { this.setRight(new JSXaal.TreeNode.DUMMYNODE()); }
	},
	setRight: function(node) {
		this.children[1] = node;
		if (!this.children[0]) { this.setLeft(new JSXaal.TreeNode.DUMMYNODE()); }
	},
	getLeft: function() {
		return this.children[0];
	},
	getRight: function() {
		return this.children[1];
	},
    getChildren: function() {
        var myChildren = new Array();
        if (this.getLeft() || this.getRight()) {
            myChildren.push(this.getLeft());
            myChildren.push(this.getRight());
        }
        return myChildren;
    }
});
JSXaal.TreeNode.DUMMYNODE = Class.create(JSXaal.TreeNode, {
	initialize: function($super) {
		$super();
		var dummyKey = new JSXaal.Key();
		dummyKey.setData('');
		this.setData(dummyKey);
	},
	getName: function() { 
		return "DUMMY";
	},
	getLeft: function() {
		return null;
	},
	getRight: function() {
		return null;
	},
	getChildren: function() {
		return new Array();
	}
});
/**
 * @class JSXaal.BinSearchTree 
 */
JSXaal.BinSearchTree = Class.create(JSXaal.BinTree, {
	initialize: function($super, id) {
		$super(id);
		this.setName("Bin Search Tree");
	},
	insert: function(value) {
		var node = this.newNode();
		node.setData(value);
	  	if (!this.getRoot()) {
			this.setRoot(node);
		} else {
  			this.getRoot().insert(node);
  		}
	},
	newNode: function(value) {
		return new JSXaal.BinSearchTreeNode();
	}
});
JSXaal.BinSearchTreeNode = Class.create(JSXaal.BinTreeNode, {
	initialize: function($super){
		$super();
	},
	insert: function(node) {
		if (node.getData() <= this.getData()) {
			if (this.getLeft()) {
				return this.getLeft().insert(node);
			} else {
  				this.setLeft(node);
  			}
		} else {
			if (this.getRight()) {
				return this.getRight().insert(node);
			} else {
				this.setRight(node);
  			}  		
  		}
  	}
});
JSXaal.Tree.TreeContours = Class.create({
	initialize: function(left, right, height, data) {
		this.cHeight = height;
		this.leftCDims = [];
		this.leftCDims[this.leftCDims.size()] = {width: -left, height: height};
		this.cLeftExtent = left;
		this.rightCDims = [];
		this.rightCDims[this.rightCDims.size()] = {width: -right, height: height};
		this.cRightExtent = right;
	},
	getHeight: function() {
		return this.cHeight;
	},
	getLeftExtent: function() {
		return this.cLeftExtent;
	},
	getRightExtent: function() {
		return this.cRightExtent;
	},
	getWidth: function() {
		return this.cRightExtent - this.cLeftExtent;
	},
	addOnTop: function(left, right, height, addHeight, originTrans) {
		this.leftCDims[this.leftCDims.size()-1].height += addHeight;
		this.leftCDims[this.leftCDims.size()-1].width += originTrans + left;
		this.rightCDims[this.rightCDims.size()-1].height += addHeight;
		this.rightCDims[this.rightCDims.size()-1].width += originTrans + right;

		this.leftCDims[this.leftCDims.size()] = {width: -left, height: height};
		this.rightCDims[this.rightCDims.size()] = {width: -right, height: height};
		this.cHeight += height + addHeight;
		this.cLeftExtent -= originTrans;
		this.cRightExtent -= originTrans;
		if (left < this.cLeftExtent) {
			this.cLeftExtent = left;
		}
		if (right > this.cRightExtent) {
			this.cRightExtent = right;
		}
	},
	joinWith: function(other, hDist) {
		if (other.cHeight > this.cHeight) {
			var newLeftC = new Array();
			var otherLeft = other.cHeight - this.cHeight;
			var thisCDisp = 0;
			var otherCDisp = 0;
			other.leftCDims.each(function (item) {
				if (otherLeft > 0 ) {
					var dim = {width: item.width, height: item.height};
					otherLeft -= item.height;
					if (otherLeft < 0) {
						dim.height += otherLeft;					
					}
					newLeftC[newLeftC.size()] = dim;
				} else {
					otherCDisp += item.width;
				}
			});
			var middle = newLeftC[newLeftC.size() - 1];

			this.leftCDims.each(function(item) {
				thisCDisp += item.width;
				newLeftC[newLeftC.size()] = {width: item.width, height: item.height};
			});
               
			middle.width -= thisCDisp - otherCDisp;
			middle.width -= hDist;
			this.leftCDims = newLeftC;
		}
		if (other.cHeight >= this.cHeight) {
			this.rightCDims = other.rightCDims.clone();
		} else {
			var thisLeft = this.cHeight - other.cHeight;
			var nextIndex = 0;

			var thisCDisp = 0;
			var otherCDisp = 0;
			this.rightCDims.each(function (item) {
				if (thisLeft > 0 ) {
					nextIndex++;
					thisLeft -= item.height;
					if (thisLeft < 0) {
						item.height += thisLeft;
					}
				} else {
					thisCDisp += item.width;
				}
			});
			for (var i = nextIndex+1;i< this.rightCDims.size();i++) {
				this.rightCDims[i] = null;
			}
			this.rightCDims = this.rightCDims.compact();
			var middle = this.rightCDims[nextIndex];

			for (i = 0; i < other.rightCDims.size(); i++) {
				var item = other.rightCDims[i];
				otherCDisp += item.width;
				this.rightCDims[this.rightCDims.size()] = {width: item.width, height: item.height};
			}
			middle.width += thisCDisp - otherCDisp;
			middle.width += hDist;
		}
		this.rightCDims[this.rightCDims.size()-1].width -= hDist;

		if (other.cHeight > this.cHeight) {
			this.cHeight = other.cHeight;
		}
		if (other.cLeftExtent + hDist < this.cLeftExtent) {
			this.cLeftExtent = other.cLeftExtent + hDist;
		}
		if (other.cRightExtent + hDist > this.cRightExtent) {
			this.cRightExtent = other.cRightExtent + hDist;
		}
	},
	calcTranslation: function(other, wantedDist) {
		var lc = this.rightCDims;
		var rc = other.leftCDims;
		var li = lc.size() - 1;
		var ri = rc.size() - 1;
        	var lCumD = {width: 0, height: 0};
		var rCumD = {width: 0, height: 0};
		var displacement = wantedDist;

		while (true) {
			if (li < 0) {
				if (ri < 0 || rCumD.height >= lCumD.height) {
					break;
				}
				var rd = rc[ri];
				rCumD.height += rd.height;
				rCumD.width += rd.width;
				ri--;
			} else if (ri < 0) {
				if (lCumD.height >= rCumD.height) {
					break;
				}
				var ld = lc[li];
				lCumD.height += ld.height;
				lCumD.width += ld.width;
				li--;
			} else {
				var ld = lc[li];
				var rd = rc[ri];
				var leftNewHeight = lCumD.height;
				var rightNewHeight = rCumD.height;
				if (leftNewHeight <= rightNewHeight) {
					lCumD.height += ld.height;
					lCumD.width += ld.width;
					li--;
				}
				if (rightNewHeight <= leftNewHeight) {
					rCumD.height += rd.height;
					rCumD.width += rd.width;
					ri--;
				}
			}
			if (displacement < rCumD.width - lCumD.width + wantedDist) {
				displacement = rCumD.width - lCumD.width + wantedDist;
			}
		}
		return displacement;
	}
});
