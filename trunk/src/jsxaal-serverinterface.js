JSXaal.ServerInterface = Class.create({
	initialize: function(jsxaalViewer) {
		this.viewer = jsxaalViewer;
		console.log("super init");
	},
	questionAnswered: function(question) {
		console.log("Unimplemented abstract method JSXaal.ServerInterface.questionAnswered(..)");
	},
	annotationAdded: function(annotation) {
		console.log("Unimplemented abstract method JSXaal.ServerInterface.annotationAdded(..)");
	},
	getViewer: function() {
		return this.viewer;
	}
});
