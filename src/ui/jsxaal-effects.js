Effect.XaalOpacity = Class.create(Effect.Base, {
  initialize: function(element, viewer) {
    this.viewer = viewer;
    this.element = this.viewer.renderer.get(element);
    var options = Object.extend({
      fill: (this.element.getFill() != 'none'),
      stroke: (this.element.getStroke() != 'none'),
      from: 255.0,
      to:   1.0
    }, arguments[2] || { });
    this.start(options);
  },
  update: function(position) {
  	if (this.options.fill) {
		this.element.setFillOpacity(position);
	}
	if (this.options.stroke) {
		this.element.setStrokeOpacity(position);
	}
  }
});
/**
 * @class Effect.XaalMove
 */
Effect.XaalMove = Class.create(Effect.Base, {
  initialize: function(element, viewer) {
    this.viewer = viewer;
    this.element = this.viewer.renderer.get(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.originalLeft = parseFloat(this.element.getLocation().x || '0');
    this.originalTop  = parseFloat(this.element.getLocation().y || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    	this.element.setLocation(Math.round(position*this.options.x + this.originalLeft),
    	(this.options.y  * position + this.originalTop).round());
  }
});

/**
 * A scale effect.
 * @class Effect.XaalScale
 */
Effect.XaalScale = Class.create(Effect.Base, {
	/**
	 * @function {public void} ?
	 * @param {Object} element
	 * @param {Object} viewer
	 */
  initialize: function(element, viewer) {
    this.viewer = viewer;
    this.element = this.viewer.renderer.get(element);
    if (!this.element) {
	throw (Effect._elementDoesNotExistError);
    }
    var options = Object.extend({
      scaleFrom: 1.0,
      scaleTo:   1.0
    }, arguments[2] || { });
    this.start(options);
  },
  /**
   * @function {public void} ?
   */
  setup: function() {
    this.factor = (this.options.scaleTo - this.options.scaleFrom);
    this.currentScale = this.options.scaleFrom;
    var bounds = this.element.getBounds();
    this.cx = bounds.x + bounds.w/2.0;
    this.cy = bounds.y + bounds.h/2.0;
  },
  update: function(position) {
    var fact = 1.0 + this.factor*position;
    var newScale = fact/this.currentScale;
    this.currentScale = fact;
    this.element.scale(newScale, newScale, this.cx, this.cy);
  }
});

/**
 * @class Effect.XaalRotate
 */
Effect.XaalRotate = Class.create(Effect.Base, {
  initialize: function(element, viewer) {
    this.viewer = viewer;
    this.element = this.viewer.renderer.get(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      cx:    -1,
      cy:    -1,
      degree: 45
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.currRot = 0;
    this.hasCoords = false;
    if (this.options.cx != -1) {
      this.hasCoords = true;
    } 
  },
  update: function(position) {
    var newRot = this.options.degree*position;
    if (this.options.cx != -1) {
      this.element.rotate(newRot - this.currRot, this.options.cx, this.options.cy);
    } else {
      this.element.rotate(newRot - this.currRot);
    }
    this.currRot = newRot;
  }
});

/**
 * Changes the style of an element.
 * @param {String} element
 * @param {JSXaalViewer} viewer
 */
Effect.XaalMorph = Class.create(Effect.Base, {
  initialize: function(element, viewer) {
    this.viewer = viewer;
    this.element = this.viewer.renderer.get(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[2] || { });
    
    if (!Object.isString(options.style)) { 
    	this.style = $H(options.style);
	//debug("ns:"+options.style + " " + this.style);
    } else {
    	//debug("string");
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      /*else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        }
      }*/
    }
    this.start(options);
  },
  
  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 ) 
      });
    }
    function getOriginal(property, elem) {
    	if (property == 'color') {
		return elem.getStroke();
	} else if (property == 'fillcolor') {
		return elem.getFill();
	}
    }
    //debug("s:"+this.style);
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;
	//debug(property+":"+value);
      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      }/* else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }*/
	//debug("value:"+value);
      var originalValue = getOriginal(property, this.element);//this.element.getStyle(property);
      return { 
        style: property,//.camelize(), 
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0), 
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      )
    });
    //debug("trans:"+this.transforms);
  },
  update: function(position) {
  	//return;
    var style = { }, transform, i = this.transforms.length;
    //debug(i);
    while(i--) {
      /*style[(transform = this.transforms[i]).style] = 
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) + 
            (transform.unit === null ? '' : transform.unit);*/
	   //debug("transform:" + this.transforms[i].style);
	   transform = this.transforms[i];
	   if (this.transforms[i].style=='color') {
	   /*	debug((Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)));*/
	   	this.element.setStroke({r: Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position),
	    	g: Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position),
	    	b: Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)});
	   } else if (transform.style=='fillcolor') {
	   	this.element.setFill({r: Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position),
	    	g: Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position),
	    	b: Math.round(transform.originalValue[2]+
		(transform.targetValue[2]-transform.originalValue[2])*position)});   	
	   }
    }
    //this.element.setStyle(style, true);
  }
})

