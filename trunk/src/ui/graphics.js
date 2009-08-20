/** @file graphics.js */
/**
 * @class Style
 */
Style = Class.create({
	/**
	 * Constructor
	 * @function {public void} Style
	*/
	initialize: function() {
	},
	setId: function(id) {
		this.id = id;
	},
	getId: function() {
		return this.id;
	},
	/**
	 * @function {public void} ?
	 * @param {Object} color
	 */
	setColor: function(color) {
		this.color = color;
	},
	/**
	 * @function {public Color} ?
	 */
	getColor: function() {
		return this.color;
	},
	/**
	 * @function {public void} ?
	 * @param {Object} color
	 */
	setFillColor: function(color) {
		this.fillColor = color;
	},
	/**
	 * @function {public Color} ?
	 */
	getFillColor: function() {
		return this.fillColor;
	},
	setFontSize: function(size) {
		this.fontSize = size;
	},
	getFontSize: function() {
		return this.fontSize;
	},
	setFontFamily: function(family) {
		this.fontFamily = family;
	},
	getFontFamily: function() {
		return this.fontFamily;
	},
	setBold: function(bold) {
		this.bold = bold;
	},
	isBold: function() {
		return this.bold;
	},
	setItalic: function(italic) {
		this.italic = italic;
	},
	isItalic: function() {
		return this.italic;
	},
	getFontWeight: function() {
		var bold = this.isBold() || "false";
		return (bold == 'true')?'bold':'normal';
	},
	setStrokeWidth: function(width) {
		this.strokeWidth = width;
	},
	getStrokeWidth: function() {
		return this.strokeWidth;
	},
	setStrokeType: function(type) {
		this.strokeType = type;
	},
	getStrokeType: function() {
		return this.strokeType;
	},
	setBackwardArrow: function(bwArrow) {
		this.backwardArrow = bwArrow;
	},
	isBackwardArrow: function() {
		return this.backwardArrow || false;
	},
	setForwardArrow: function(fwArrow) {
		this.forwardArrow = fwArrow;
	},
	isForwardArrow: function() {
		return this.forwardArrow || false;
	},});
