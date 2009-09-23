var JSAnimatorStore = {};
var JSXaalAnimatorCount = 0;
/**
 * Animator for the JSXaal viewer.
 * <b>TODO:</b> Move to JSXaal.Animator
 * @class JSAnimator
 */
var JSAnimator = Class.create({
	/**
	 * @function {public void} JSAnimator
	 * @param {Object} viewer
	 */
	initialize: function(viewer) {
		this.viewer = viewer;
		this.id = "jsxaal-animator-" + JSXaalAnimatorCount;
		JSXaalAnimatorCount++;
		this.backwardStack = new Array();
		this.forwardStack = new Array();
		this.fwButton = null;
		this.bwButton = null;
		this.rwButton = null;
		// for smooth animation
		this.effects = new Array();
		this.queue = null;
		this.minStepViewer = 0;
		this.maxStepViewer = 0;
	},
	/**
	 * @function {public void} ?
	 * @param {Object} shapeId
	 * @param {Object} effectName
	 * @param {Object} options
	 */
	addEffect: function(shapeId, effectName, options) {
		if (!shapeId) {
			return;
		}
		this.effects.push([effectName,shapeId,options]);
	},
	/**
	 * Sets the operation stack of this animator.
	 * @function {public void} ?
	 * @param {Object} xaalNode
	 */
	setAnimation: function(arrayOfNodes) {
		this.forwardStack = arrayOfNodes;
		this.updateControls();
		this.createSlider();
	},
	/**
	 * Moves forward in the animation if such state exists.
	 * @function {public void} ?
	 */
	forward: function() {
		this.disableControls();
		o = this.forwardStack.pop();
		if (o) {
			try {
				this.viewer.parser.handleElement(o);
			} catch (e) {
				debug("" + e);
			}
		}
		this.backwardStack.push(o);
		this.applyEffects();
		setTimeout(this.updateControls.bind(this), 500);
		this.effects = new Array();
		this.viewer.ui.setNarrative(this.narrativeText);
		this.narrativeText = "";
		if (this.viewers) {
			this.viewers.each(function(item) {
				var step = Number(item.key);
				if ((step + this.backwardStack.size()) == 0) {
					item.value.renderInitialElement(item.value.animator.initial);
				} else if (step + this.backwardStack.size() > 0 && step <= this.forwardStack.size()) {
					item.value.animator.forward();
				} else {
					item.value.renderer.clear();
				}
			}.bind(this));
		}
	},
	/**
	 * Moves backward in the animation if such state exists.
	 * @function {public void} ?
	 */
	backward: function() {
		this.disableControls();
		var pos = this.backwardStack.size();
		this.rewind();
		var oldSmooth = this.viewer.settings.isSmoothAnimation();
		if (oldSmooth) {
			this.viewer.settings.toggleSmoothAnimation();
		}
		while (pos > 1) {
			this.forward();
			pos--;
		}
		if (oldSmooth) {
			this.viewer.settings.toggleSmoothAnimation();
		}
	},
	/**
	 * Rewinds the animator.
	 * @function {public void} ?
	 */
	rewind: function() {
		this.disableControls();
		while (this.backwardStack.size() > 0) {
			this.forwardStack.push(this.backwardStack.pop());
		}
		this.viewer.renderer.clear();
		this.viewer.renderInitialElement(this.initial);
		this.updateControls();
		if (this.viewers) {
			this.viewers.each(function(item) {
				item.value.animator.rewind();
				var step = Number(item.key);
				if (step < 0) {
					item.value.renderer.clear();
				} else if (step > 0) {
					for (var i=0; i<step; i++) {
						item.value.animator.forward();
					}
				}
			});
		}
	},
	refresh: function() {
		if (this.backwardStack.size() == 0) {
			this.viewer.renderer.clear();
			this.viewer.renderInitialElement(this.initial);
		}
		this.backward();
		this.forward();
	},
	/**
	 * Sets the animator control buttons enabled/disabled depending on the
	 * state of the animator.
	 * @function {private void} ?
	 */
	updateControls: function() {
		var disabled = false;
		if (!this.backwardStack || this.backwardStack.size() === 0) {
			disabled = true;
            if (this.rwButton) {
                this.rwButton.disable();
            }
            if (this.bwButton) {
                this.bwButton.disable();
            }
		} else {
    		if (this.rwButton) {
    			this.rwButton.enable();
    		}
    		if (this.bwButton) {
    			this.bwButton.enable();
    		}
        }
		disabled = false;
		if (!this.forwardStack || this.forwardStack.size() === 0) {
			disabled = true;
            if (this.fwButton) {
                this.fwButton.disable();
            }
		} else {
            if (this.fwButton) {
                this.fwButton.enable();
            }
        }
		if (this.progressBar) {
			this.progressBar.setSelection(this.backwardStack.size());
			var counter = $(this.id + '-counter');
			counter.update((this.backwardStack.size() + 1) + '/' + (this.backwardStack.size() + 
				this.forwardStack.size() + 1)); 
		}
	},
	createSlider: function() {
		if (!this.viewer.settings.isShowAnimator()) {
			return;
		}
		try {
			this.progressBar = new ProgressBar(this.id + '-slider', {classProgressBar: 'jsxaal-sliderelem', style: ProgressBar.DETERMINATE, maximum: this.backwardStack.length+this.forwardStack.length, selection: 0, color: {r: 128, g: 128, b: 128}});
				var counter = $(this.id + '-counter');
				counter.update('1/' + (this.backwardStack.size() + 
					this.forwardStack.size() + 1)); 
		} catch(exp) {
			$(this.id + '-slider').remove();
		}
	},
	/**
	 * Disables all controls of the animator.
	 * @function {private void} ?
	 */
	disableControls: function() {
		if (this.rwButton) {
			this.rwButton.disable();
		}
		if (this.bwButton) {
			this.bwButton.disable();
		}
		if (this.fwButton) {
			this.fwButton.disable();
		}
	},
	/**
	 * @function {private void} ?
	 */
	applyEffects: function() {
		var eff = "";
		var effCount = 0;
		var parCount = 0;
		var length = this.effects.size();
		for (var i = 0; i<length;i++) {
			if (this.effects[i][1] == 'startpar') {
				if (effCount !== 0) {
					eff += ";";
				}
				eff += "new Effect.Parallel([";
			} else if (this.effects[i][1] == 'endpar') {
				eff += "]";
				eff += ", {afterFinish:function() {"; 
				
				//eff +=");";
				parCount++;
				effCount = 0;
			} else if (this.effects[i][0] == 'draw') {
				eff += "this.viewer.dsStore.get('" + this.effects[i][1] + "').draw(this.viewer.renderer);";
			} else {
				if (effCount !== 0) {
					eff += ",";
				}
				effCount++;
				eff += "new Effect." + this.effects[i][0];
				eff += "('" + this.effects[i][1] + "', JSXaalViewerStore['" +this.viewer.ui.elemId + "']," + this.effects[i][2] + ")";
			}
		}
		while (parCount--) {
			eff += "}})";
		}
		eff += ";";
		//debug(eff);
		eval(eff);
		//alert("aply "+this.effects.size()+" "+eff);
	},
	/**
	 * @function {private void} ?
	 * @param {Object} elemId
	 */
	createPanel: function(elemId){
		if (!this.viewer.settings.isShowAnimator()) {
			return;
		}
		var el = $(elemId);
		if (!el) {
			el = new Element("div", {id: elemId});
			var parent = $(this.viewer.ui.elemId);
			parent.insertBefore(el, parent.firstChild);
		}
		el.addClassName('jsxaal-animation-panel');
		var slider = new Element('div', {id: this.id + '-slider'});
		slider.addClassName('jsxaal-slider');
		el.insert(slider);
		var counter = new Element('span', {id: this.id + '-counter'});
		counter.addClassName('jsxaal-counter');
		counter.update('1');
		el.insert(counter);
		if (el) {
			JSAnimatorStore[this.id] = this;
			this.rwButton = new Element('input', {id: this.id + 'jsmatrix-rwb', type: 'button', value: 'Rewind', disabled: 'true' });
			this.rwButton.observe('click', function(e) {this.rewind();e.stop();}.bind(this));
			el.appendChild(this.rwButton);
			this.bwButton = new Element('input', {id: this.id + 'jsmatrix-bb', type: 'button', value: 'Backward', disabled: 'true' });
			this.bwButton.observe('click', function(e) {this.backward();e.stop();}.bind(this));
			el.appendChild(this.bwButton);
			this.fwButton = new Element('input', {id: this.id + 'jsmatrix-fb', type: 'button', value: 'Forward', disabled: 'true' });
			this.fwButton.observe('click', function(e) {this.forward();e.stop();}.bind(this));
			el.appendChild(this.fwButton);
		}
	},
	/** 
	 * @function {public void} ?
	 * @param {Object} narrativeText
	 */
	setNarrative: function(narrativeText) {
		this.narrativeText = narrativeText;
	},
	/**
	 * @function {public void} ?
	 * @param {Object} element - an XML node describing the polygon element that was drawn.
	 */
	addAnnotation: function(element) {
		var node = this.backwardStack[this.backwardStack.length - 1];
		if (!node) {
			this.addStudentAnnotation(this.initial, element);
		} else {
			if (!(node.nodeName.toLowerCase() == 'seq' || node.nodeName.toLowerCase() == 'par')) {
				var elem = new Element('par');
				this.addStudentAnnotation(elem, element);
			} else {
				this.addStudentAnnotation(node, element);
			}
		}
	},
	/**
	 * Adds the annotation to the <texttt>&lt;student-annotation></texttt> element
	 * of the given <code>element</code>. If no student-annotation element exists, one
	 * will be created and appended to the element.
	 * @function {private void} ?
	 * @param {Object} element
	 * @param {Object} annotation
	 */
	addStudentAnnotation: function(element, annotation) {
		var stuAnn = element.getElementsByTagName("student-annotation");
		if (stuAnn.length > 0) {
			stuAnn = stuAnn[0];
			stuAnn.appendChild(annotation);
		} else {
			stuAnn = new Element('student-annotation');
			stuAnn.appendChild(annotation);
			element.appendChild(stuAnn);
		}
		if (this.viewer.getServerInterface()) {
			this.viewer.getServerInterface().annotationAdded(annotation);
		}
	},
	/**
	 * Stores the initial state of the animation to the animator. This is needed in
	 * rewinding the animation.
	 * @function {public void} ?
	 * @param {Object} initialElem
	 */
	setInitial: function(initialElem) {
		this.initial = initialElem;
	},
	addStepViewer: function(stepDiff, options) {
		if (!this.viewers) {
			this.viewers = new Hash();
		}
		var mainDrawingPanel = $(this.viewer.id + '-drawing');
		var elem = new Element('div', {id: this.viewer.id + stepDiff});
		elem.addClassName('jsxaal-additionalview');
		//debug(mainDrawingPanel.getWidth());
		var newHeight = options.scale*mainDrawingPanel.getHeight();
		elem.setStyle({width: options.scale*mainDrawingPanel.getWidth() + 'px', height:options.scale*mainDrawingPanel.getHeight() + 'px'});
		elem.setStyle({paddingTop: (mainDrawingPanel.getHeight() - newHeight)/2 + 'px'});
		
		if (stepDiff < 0) {
			mainDrawingPanel.insert({before: elem});
		} else {
			mainDrawingPanel.insert({after: elem});

		}
		var newSettings = Object.extend({}, this.viewer.settings.settings);
		newSettings = Object.extend(newSettings, {showAnimator: false, showNarrative: false, settingsPanel: false, smoothAnimate: false});
		var newOptions = {};
		newOptions = Object.extend(newOptions, this.viewer.options);
		newOptions = Object.extend(newOptions, options);
		var newViewer = new JSXaalViewer(this.viewer.id + stepDiff, newSettings, newOptions);
		elem.appendChild(document.createTextNode(options['title']));
		elem = $(newViewer.id + '-drawing');
		if (stepDiff < 0) {
			newViewer.renderer.clear();
		} else {
			for (var i = 0; i < stepDiff; i++) {
				newViewer.animator.forward();
			}
		}
		newViewer.renderer.zoom(options.scale, options.scale, 0.01, 0.01);//, elem.getWidth()/2, elem.getHeight()/2);
		this.viewers.set(stepDiff, newViewer);
		this.minStepViewer = Math.min(this.minStepViewer, stepDiff);
		this.maxStepViewer = Math.max(this.maxStepViewer, stepDiff);
	}
});