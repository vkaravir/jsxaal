var JSXaalInteractionParser = {};
JSXaalInteractionParser.register = function(parser) {
	parser.registerElementHandlerFunction("select-one", JSXaalInteractionParser.renderSelectOneElement);
	parser.registerElementHandlerFunction("select", JSXaalInteractionParser.renderSelectElement);
};
/**
 * @function {public void} ?
 * @param {Object} viewer
 * @param {Object} node
 */
JSXaalInteractionParser.renderSelectOneElement = function(viewer, node) {
	var children = node.childElements();
	var q = new JSXaal.Question.SelectOne(node.readAttribute("id"), viewer);
	var solutionId = node.readAttribute("solutionId");
	var answered = node.getElementsByTagName("student-answer").length > 0;
	if (!answered) {
		for ( var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeName.toLowerCase() == 'contents'
					&& child.readAttribute("type") == "label") {
				q.setQuestionText(JSXaal.Util.getContentsAsText(child));
			} else if (child.nodeName.toLowerCase() == 'item') {
				var item = new JSXaal.Question.Item(child.readAttribute("id"));
				var contents = child.getElementsByTagName("contents");
				for ( var j = 0; j < contents.length; j++) {
					if (contents[j].readAttribute("type") == "answer") {
						item.setAnswer(JSXaal.Util
								.getContentsAsText(contents[j]));
					} else if (contents[j].readAttribute("feedback")) {
						item.setFeedback(JSXaal.Util
								.getContentsAsText(contents[j]));
					}
				}
				if (solutionId && solutionId == child.readAttribute("id")) {
					q.setCorrectAnswer(item);
				}
				q.addAnswerOption(item);
			} else if (child.nodeName.toLowerCase() == 'student-answer') {
				answered = true;
				break;
			}
		}
		if (viewer.settings.isStoreQuestionAnswers()) {
			q.setXmlNode(node);
		}
		viewer.ui.showQuestion(q);
	}
};
/**
 * @function {public void} ?
 * @param {Object} viewer
 * @param {Object} node
 */
JSXaalInteractionParser.renderSelectElement = function(viewer, node) {
	var children = node.childElements();
	var q = new JSXaal.Question.Select(node.readAttribute("id"), viewer);
	var solutionId = node.readAttribute("solutionId");
	var answered = node.getElementsByTagName("student-answer").length > 0;
	if (!answered) { // ignore the question if student has already answered it
		for ( var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeName.toLowerCase() == 'contents'
					&& child.readAttribute("type") == "label") {
				q.setQuestionText(JSXaal.Util.getContentsAsText(child));
			} else if (child.nodeName.toLowerCase() == 'item') {
				var item = new JSXaal.Question.Item(child.readAttribute("id"));
				item.setGrade(child.readAttribute("grade"));
				var contents = child.getElementsByTagName("contents");
				for ( var j = 0; j < contents.length; j++) {
					if (contents[j].readAttribute("type") == "answer") {
						item.setAnswer(JSXaal.Util
								.getContentsAsText(contents[j]));
					} else if (contents[j].readAttribute("feedback")) {
						item.setFeedback(JSXaal.Util
								.getContentsAsText(contents[j]));
					}
				}
				if (solutionId && solutionId == child.readAttribute("id")) {
					q.setCorrectAnswer(item);
				}
				q.addAnswerOption(item);
			} else if (child.nodeName.toLowerCase() == 'student-answer') {
				answered = true;
				break;
			}
		}
		if (viewer.settings.isStoreQuestionAnswers()) {
			q.setXmlNode(node);
		}
		viewer.ui.showQuestion(q);
	}
};
