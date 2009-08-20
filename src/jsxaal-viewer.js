/**
 * @file jsxaal-viewer.js This file contains the main class of the JSXaal viewer.
 */
var JSXaal = Class.create();
var JSXaalViewerStore = {};
/**
 * <b>TODO</b>: move this to be JSXaal.Viewer
 * @class JSXaalViewer
 */
var JSXaalViewer = Class.create({
/**
 * Constructor
 * @function {public void} JSXaalViewer
 * @param {Object} fileUrl
 * @param {Object} elementId
 * @param {optional Array} settings Settings passed on to the {@link JSXaalViewerSettings}.
 * @param {optional String} format Parameter specifying the xslt-file url. This parameter has to 
 * 	be specified if the xslt-approach is to be used. Note, that in this case you must also 
 * 	provide the settings array.  
 */
	initialize: function(elementId, settings, options) {
		this.id = elementId;
		this.options = options;
		this.toolbar = new JSXaal.UI.Toolbar(this);
		this.settings = new JSXaalViewerSettings(this, settings);
		this.animator = new JSAnimator(this);
		this.ui = new JSXaal.UI(elementId, this);
		if (Graphic.rendererSupported("VML")) {
			this.renderer = new Graphic.VMLRenderer(this.ui.drawingId);
		} else if (Graphic.rendererSupported("SVG")) {
			this.renderer = new Graphic.SVGRenderer(this.ui.drawingId);
		} else if (Graphic.rendererSupported("Canvas")) {
			this.renderer = new Graphic.CanvasRenderer(this.ui.drawingId);
		}
        	this.toolManager = new Graphic.ToolManager(this.renderer);
		//this.toolManager.setTool(new Graphic.HighlightTool());
		//this.toolManager.setTool(new Graphic.DrawingTool());
		this.dsStore = new Hash();
		this.styleStore = {};
		this.dsGraphicsMap = {};
		this.parser = new JSXaalParser(this);
		//this.fileUrl = fileUrl;
		JSXaalViewerStore[elementId] = this;
		JSXaalParserDS.register(this.parser);
		JSXaalParserGP.register(this.parser);
		JSXaalParserAnim.register(this.parser);
		JSXaalInteractionParser.register(this.parser);
		JSXaalMainParser.register(this.parser);
		this.parser.registerElementHandlerFunction("narrative", this.renderNarrativeElement);
		var args = $H(options);
		this.fileUrl = args.get('fileUrl');
		if (args.get('stylesheet') && this.fileUrl) {
			this.xsltfile = args.get('stylesheet');
			this.transformFile();
		} else if (args.get('srcElem')) {
			this.initFromElement(args.get('srcElem'));
		} else if (this.fileUrl) {
			this.loadFile();
		} else {
			alert("check your parameters!");
		}
	},
	/**
	 * @function {public void} ?
	 * @param {String} fileName - name of the file
	 */
	setFile: function(fileName) {
		this.clear();
		this.fileUrl = fileName;
		this.loadFile();
	},
	clear: function() {
		this.renderer.clear();
		this.animator = new JSAnimator(this);
		this.dsStore = new Hash();
		this.styleStore = {};
	},
	/**
	 * This function should not be called directly. It loads the animation and
	 * the required xslt-file used in the xslt-transformation approach.
	 * @function {private void} ?
	 * @author ville
	 */
	transformFile: function() {
		this.animator.createPanel(this.ui.elemId + '-panel');
		var request = new Ajax.Request(this.fileUrl, {
		  method: 'get',
		  asynchronous: false,
		  onSuccess: function(transport) {this.xmlsrc = transport.responseXML;}.bind(this),
		  onFailure: function() {
		  	alert("Failed to load the document at:\n"+this.fileUrl);
		  }
		});
		var request2 = new Ajax.Request(this.xsltfile, {
		method: 'get',
		  asynchronous: false,
		  onSuccess: this.transformSuccess.bind(this),
		  onFailure: function() {
		  	alert("Failed to load the document at:\n"+xslt);
		  }	
		});
	},
	transformSuccess: function(transport) {
		var xslt = transport.responseXML;
		// code for IE
		if (window.ActiveXObject) {
  			ex = this.xmlsrc.transformNode(xslt);
  		}
		// code for Mozilla, Firefox, Opera, etc.
		else if (document.implementation && document.implementation.createDocument) {
  			xsltProcessor = new XSLTProcessor();
  			xsltProcessor.importStylesheet(xslt);
  			resultDocument = xsltProcessor.transformToDocument(this.xmlsrc);
			this.xmlsrc = null;
  			this.render(JSXaal.Util.recreateDocument(resultDocument.childNodes[0], this));
  		}
	},
	loadFile: function() {
		this.animator.createPanel(this.ui.elemId + '-panel');
		var successFunction = this.success.bind(this);
		var request = new Ajax.Request(this.fileUrl, {
		  method: 'get',
		  asynchronous: false,
		  onSuccess: successFunction,
		  onException: function(request, e) {debug("Xaal exception: "+e.message);},
		  onFailure: function() {
		  	alert("Failed to load the document at:\n"+this.fileUrl);
		  }
		});
	},
	initFromElement: function(srcElem) {
		debug($(srcElem).innerHTML.escapeHTML());
		this.animator.createPanel(this.ui.elemId + '-panel');
		this.render(JSXaal.Util.recreateDocument($(srcElem).getElementsByTagName('xaal')[0], this));
	},
	reload: function() {
		this.renderer.clear();
		if (!this.xsltfile) {
			this.loadFile();
		} else {
			this.transformFile();
		}
	},
	success: function(transport) {
		//alert(transport.responseText);
		//alert(Builder.build(transport.responseText).readAttribute("id"));
	  	var response = transport.responseXML;
	  	this.render(JSXaal.Util.recreateDocument(response.documentElement, this));
	  	//this.render(Builder.build(transport.responseText));
	},
	render: function(xaalDocument) {
		var x = xaalDocument;
		var msg = "";
		var i = 0;
		var children = xaalDocument.childElements();
		for (; i < children.length; i++) {
			if (children[i].nodeName.toLowerCase() == 'initial') {
				this.renderInitialElement(children[i]);
				this.animator.setInitial(children[i]);
			} else if (children[i].nodeName.toLowerCase() == 'animation') {
				this.animator.setAnimation(children[i].childElements().reverse());
			} else if (children[i].nodeName.toLowerCase() == 'defs') {
				this.parser.handleElement(children[i]);
			}
		}
	},
	/**
	 * A function that renders the contents of the <code>initial</code> element
	 * of the Xaal document.
	 * @function {private void} ?
	 * @param {Object} initialNode
	 */
	renderInitialElement: function(initialNode) {
		var children = initialNode.childElements();
		var length = children.length;
		for (var i = 0; i < length; i++) {
			try {
				var obj = this.parser.handleElement(children[i]);
				if (JSXaal.Util.isShapeObject(obj)) {
					this.renderer.add(obj);
				} else {
					debug("not a shape object ");					
				}					
			} catch (e) {
				debug("EROR:" + e.name + " - " + e.message);
			}
		}
	},
	renderNarrativeElement: function(viewer, narrativeNode) {
		if (!viewer.settings.isShowNarrative()) {
			return;
		}
		viewer.animator.setNarrative(JSXaal.Util.getContentsAsText(narrativeNode));
	},
	setServerInterface: function(si) {
		this.serverInterface = si;
	},
	getServerInterface: function() {
		return this.serverInterface;
	},
	exportSvg: function(targetElem) {
		if (!(this.renderer instanceof Graphic.SVGRenderer)) {
			debug("only SVG can be exported");
			return;
		}
		var elem = $(targetElem);
		var src = $(this.ui.elemId + '-drawing');
		elem.update(JSXaal.Util.getContentsAsText(src).escapeHTML());
	},
	showAnotherStep: function(stepDiff, options) {
		options = Object.extend({title: 'Step ' + stepDiff, scale: 0.3}, options || {});
		debug('showing step ' + stepDiff);
		this.animator.addStepViewer(stepDiff, options);
	}
});