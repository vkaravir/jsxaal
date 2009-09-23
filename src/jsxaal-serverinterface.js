/**
 * A class used to communicate with a server side when user is interacting
 * with the animation. This can be adding annotations or answering questions.
 * @class JSXaal.ServerInterface
 */
JSXaal.ServerInterface = Class.create({
	initialize: function(jsxaalViewer) {
		this.viewer = jsxaalViewer;
	},
	/**
	 * This function is called whenever a student answers a question.
	 * @function {public void} ?
	 * @param {JSXaal.Question.AbstractQuestion} question - The question that was answered.
	 */
	questionAnswered: function(question) {
		if (console) {
			console.log("Unimplemented abstract method JSXaal.ServerInterface.questionAnswered(..)");
		}
	},
	/**
	 * This function is called whenever a student adds annotations.
	 * @function {public void} ?
	 * @param {?} annotation - an XML node describing the annotated polygon element that was drawn.
	 */
	annotationAdded: function(annotation) {
		if (console) {
			console.log("Unimplemented abstract method JSXaal.ServerInterface.annotationAdded(..)");
		}
	},
	getViewer: function() {
		return this.viewer;
	}
});
