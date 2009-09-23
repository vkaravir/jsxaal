/**
 * This file contains the settings class for the JSXaal viewer.
 * @file jsxaal-viewersettings.js
 */
/**
 * <b>TODO:</b> rename to be JSXaal.Viewer.Settings
 * @class JSXaalViewerSettings
 */
var JSXaalViewerSettings = Class.create({
	/**
	 * @function {public void} JSXaalViewerSettings
	 * @param {Object} viewer
	 */
	initialize: function(viewer) {
		this.viewer = viewer;
		this.settings = Object.extend({
		      smoothAnimate:    false,
		      settingsPanel:	false,
		      showNarrative: 	true,
		      storeQuestionAnswers: true,
		      showAnimator:	true,
		      language:		'en'
		    }, arguments[1] || { });
		this.annotation = new JSXaal.UI.Toolbar.AnnotationColor(this.viewer);
		this.zoom = new JSXaal.UI.Toolbar.Zoom(this.viewer);
		this.lang = new JSXaal.UI.Toolbar.Language(this.viewer, this.settings.language);
		this.viewer.toolbar.addCommand("zoom", this.zoom);
		this.viewer.toolbar.addCommand("annotation", this.annotation);
		this.viewer.toolbar.addCommand("lang", this.lang);
	},
	/**
	 * @function {public boolean} ?
	 */
	isSmoothAnimation: function() {
		return this.settings.smoothAnimate;
	},
	/**
	 * @function {public void} ?
	 */
	toggleSmoothAnimation: function() {
		this.settings.smoothAnimate = !this.settings.smoothAnimate;
	},
	/**
	 * @function {public boolean} ?
	 */
	isSettingsPanel: function() {
		return this.settings.settingsPanel;
	},
	/**
	 * @function {public boolean} ?
	 */
	isShowNarrative: function() {
		return this.settings.showNarrative;
	},
	/**
	 * @function {public boolean} ?
	 */
	isShowAnimator: function() {
		return this.settings.showAnimator;
	},
	/**
	 * @function {public void} ?
	 */
	toggleDrawingTool: function() {
		this.settings.drawingTool = !this.settings.drawingTool;
		this.annotation.toggleDrawingTool();
	},
	/**
	 * @function {public boolean} ?
	 */
	isDrawingTool: function() {
		return this.settings.drawingTool;
	},
	/**
	 * @function {public boolean} ?
	 */
	isStoreQuestionAnswers: function() {
		return this.settings.storeQuestionAnswers;
	},
	/**
	 * @function {public void} ?
	 * @param {String} lang - the language to be added
	 */
	addLanguage: function(lang) {
		if (this.lang) {
			this.lang.addLanguage(lang);
		}
	},
	/**
	 * @function {public String} ?
	 */
	getLanguage: function() {
		if (this.lang) {
			return this.lang.lang;
		} else {
			return this.settings.language;
		}
	}
});
/**
 * A class that handles the annotation functionality.
 * @class JSXaal.UI.Toolbar.AnnotationColor
 */
JSXaal.UI.Toolbar.AnnotationColor = Class.create({
	/**
	 * Constructor for the class.
	 * @function {public void} ?
	 * @param {Object} viewer Viewer object
	 */
	initialize: function(viewer) {
		this.viewer = viewer;
		this.color = "black";
	},
	/**
	 * A method that creates the necessary html elements for this toolbar component.
	 * @function {public Element} ?
	 * @return element
	 */
	create: function() {
		var elem = new Element("span");
		elem.appendChild(this._createCheckBoxElement(this.viewer.settings.isDrawingTool(), 'DrawingTool'));
		//var checkDraw = new Element('span');
        var label = new Element("label");
        label.setAttribute('for', this.viewer.id + '-' + 'DrawingTool');
        //label.appendChild(document.createTextNode(' smooth animation'));
        label.appendChild(document.createTextNode("draw annotations"));
        elem.appendChild(label);
		//elem.appendChild(checkDraw);
		var sel = new Element("select");
		sel.observe('change', this.colorChanged.bind(this));
		
		JSXaal.Util.colorNames.each(function (item, index) {
			var col = document.createElement("option");
			col.style.background = item.key;
			col.innerHTML = "&nbsp;" + item.key;
			col.value = item.key;
			if (item.key == 'black') {
				col.selected = "selected";
				sel.style.background=item.key;
				col.style.color = "white";
			}
			sel.appendChild(col);
		});
		this.sel = sel;
		elem.appendChild(this.sel);
		return elem;
	},
	/**
	 * @function {private String} ?
	 * @param {Object} checked
	 * @param {Object} name
	 */
	_createCheckBoxElement: function(checked, name) {
		var elem = new Element('input', {type: 'checkbox', name: name, id: this.viewer.id + '-' + name});
		if (checked) {
			elem.checked = 'true';
		}
		elem.observe('click', this.viewer.settings['toggle' + name].bind(this.viewer.settings));
		return elem;
	},
	/**
	 * Method called when value in the checkbox changes.
	 * @function {public void} ?
	 * @param evt The event
	 */
	colorChanged: function(evt) {
		var elem = evt.element();
		elem.style.background = elem.value;
		this.color = elem.value;
		if (this.viewer.settings.isDrawingTool()) {
			this.viewer.toolManager.getTool().setStroke(JSXaal.Util.colorNames.get(this.color));
		}
	},
	/**
	 * @function {public void} ?
	 */
	toggleDrawingTool: function() {
		if (!this.color) {
			this.color = "black";
		}
		var currTool = this.viewer.toolManager.getTool();
		if (this.viewer.settings.isDrawingTool()) {
			if (currTool instanceof Graphic.DrawingTool) {
				currTool.setStroke(JSXaal.Util.colorNames.get(this.color));
				currTool.activate(this.viewer.toolManager);
			} else {
				var newTool = new Graphic.DrawingTool();
				newTool.endDrag = this.endDrag.bind(this);
				newTool.setStroke(JSXaal.Util.colorNames.get(this.color));
				this.viewer.toolManager.setTool(newTool);
			}
		} else {
			var currTool = this.viewer.toolManager.getTool();
			if (currTool instanceof Graphic.DrawingTool) {
				currTool.unactivate(this.viewer.toolManager);
			}
		}
	}, 
	/**
	 * @function {public void} ?
	 */
	endDrag: function() {
		var polyline = this.viewer.toolManager.getTool().polyline;
		this.viewer.toolManager.getTool().polyline = null;
		var elem = new Element('polyline', {id: "student-anno-" + JSXaal.Util.shapeCounter++});
		polyline.getPoints().each(function(item) {
			elem.appendChild(new Element('coordinate', {x: item[0], y: item[1]}));	
		});
		var style = new Element('style');
		style.appendChild(new Element('color', {name: this.color}));
		style.appendChild(new Element('stroke', {type: 'solid', width: '1'}));
		elem.appendChild(style);
		this.viewer.animator.addAnnotation(elem);
	}
});
JSXaal.UI.Toolbar.Zoom = Class.create({
	/**
	 * Constructor for the class.
	 * @function {public void} ?
	 * @param {Object} viewer Viewer object
	 */
	initialize: function(viewer) {
		this.viewer = viewer;
		this.zoom = 1.0;
		this.zoomFactor = 1.2;
	},
	/**
	 * A method that creates the necessary html elements for this toolbar component.
	 * @function {public Element} ?
	 * @return element
	 */
	create: function() {
		var elem = new Element("span");
		elem.appendChild(document.createTextNode(' Zoom:'))

		var zoomOut = new Element("a", {href: '#'});
		zoomOut.addClassName('zoom');
		zoomOut.addClassName('zoomOut');
		elem.appendChild(zoomOut);
		zoomOut.observe('click', function(evt) {
			evt.stop();
			this.zoom = this.zoom / this.zoomFactor;
			this.viewer.renderer.zoom(this.zoom, this.zoom);
		}.bind(this));

		var zoomIn = new Element("a", {href: '#'});
		zoomIn.addClassName('zoom');
		zoomIn.addClassName('zoomIn');
		elem.appendChild(zoomIn);
		zoomIn.observe('click', function(evt) {
			evt.stop();
			this.zoom = this.zoom * this.zoomFactor;
			this.viewer.renderer.zoom(this.zoom, this.zoom);
		}.bind(this));
		elem.appendChild(document.createTextNode(" "));
		return elem;
	}
});
JSXaal.UI.Toolbar.Language = Class.create({
	/**
	 * Constructor for the class.
	 * @function {public void} ?
	 * @param {Object} viewer Viewer object
	 */
	initialize: function(viewer, lang) {
		this.viewer = viewer;
		this.lang = lang;
		this.languages = [];
		this.languages.push(lang);
	},
	/**
	 * A method that creates the necessary html elements for this toolbar component.
	 * @function {public Element} ?
	 * @return element
	 */
	create: function() {
		var elem = new Element("span", {id: this.viewer.id + "-langtoolbar"});
		elem.update("Language: ");
		var sel = new Element("select");
		sel.observe('change', this.languageChanged.bind(this));
		
		this.languages.each(function(item, index) {
			var col = document.createElement("option");
			col.innerHTML = item;
			col.value = item;
			if (item.key == this.lang) {
				col.selected = "selected";
			}
			sel.appendChild(col);
		});
		this.sel = sel;
		elem.appendChild(this.sel);
		
		return elem;
	},
	/**
	 * Method called when value in the checkbox changes.
	 * @function {public void} ?
	 * @param evt The event
	 */
	languageChanged: function(evt) {
		var elem = evt.element();
		this.lang = elem.value;
		this.viewer.animator.refresh();
	},
	addLanguage: function(lang) {
		if (this.languages.indexOf(lang) == -1) {
			var col = document.createElement("option");
			col.innerHTML = lang;
			col.value = lang;
/*			if (item.key == this.lang) {
				col.selected = "selected";
			}*/
			this.sel.appendChild(col);
		}
	}
});