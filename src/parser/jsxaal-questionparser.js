var JSXaalInteractionParser = {};
JSXaalInteractionParser.register = function(parser) {
	//parser.registerElementHandlerFunction("question", JSXaalInteractionParser.renderQuestionElement);
	parser.registerElementHandlerFunction("select-one", JSXaalInteractionParser.renderSelectOneElement);
	parser.registerElementHandlerFunction("select", JSXaalInteractionParser.renderSelectElement);
};
// for jhave type of questions
/*JSXaalInteractionParser.renderQuestionElement = function(viewer, qNode) {
	var children = qNode.childNodes;
	var type = qNode.readAttribute("type");
	var q;
	if (type == 'TFQUESTION') {
		q = new JSXaalTFQuestion(qNode.readAttribute("id"), viewer);
	}
	if (!q) {
		return;
	}
	var answerOptions = [];
	var question = '';
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeType == 1) {
			//alert(child);
			if (child.nodeName.toLowerCase() == 'question_text') {
				question = JSXaal.Util.getContentsAsText(child);
			} else if (child.nodeName.toLowerCase() == 'answer_option') {
				q.addAnswerOption(JSXaal.Util.getContentsAsText(child), child.attributes);
			}
		}
	}
	q.setQuestionText(question);
	//alert("answerOptions:\n"+answerOptions);
	viewer.ui.showQuestion(q);
	//viewer.renderer.add(circle);
	return {type: type, question: question, answerOptions: answerOptions};
};*/
/**
 * @function {public void} ?
 * @param {Object} viewer
 * @param {Object} node
 */
JSXaalInteractionParser.renderSelectOneElement = function(viewer, node) {
	var children = node.childElements();
	var q = new JSXaal.Question.SelectOne(node.readAttribute("id"), viewer);
	var solutionId = node.readAttribute("solutionId");
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'contents' && child.readAttribute("type") == "label") {
			q.setQuestionText(JSXaal.Util.getContentsAsText(child));
		} else if (child.nodeName.toLowerCase() == 'item') {
			var item = new JSXaal.Question.Item(child.readAttribute("id"));
			var contents = child.getElementsByTagName("contents");
			for (var j=0; j<contents.length; j++) {
				if (contents[j].readAttribute("type") == "answer") {
					item.setAnswer(JSXaal.Util.getContentsAsText(contents[j]));
				} else if (contents[j].readAttribute("feedback")) {
					item.setFeedback(JSXaal.Util.getContentsAsText(contents[j]));
				}
			}
			if (solutionId && solutionId == child.readAttribute("id")) {
				q.setCorrectAnswer(item);
			}
			q.addAnswerOption(item);
		}
	}
	if (viewer.settings.isStoreQuestionAnswers()) {
		q.setXmlNode(node);
	}
	viewer.ui.showQuestion(q);
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
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.nodeName.toLowerCase() == 'contents' && child.readAttribute("type") == "label") {
			q.setQuestionText(JSXaal.Util.getContentsAsText(child));
		} else if (child.nodeName.toLowerCase() == 'item') {
			var item = new JSXaal.Question.Item(child.readAttribute("id"));
			item.setGrade(child.readAttribute("grade"));
			var contents = child.getElementsByTagName("contents");
			for (var j=0; j<contents.length; j++) {
				if (contents[j].readAttribute("type") == "answer") {
					item.setAnswer(JSXaal.Util.getContentsAsText(contents[j]));
				} else if (contents[j].readAttribute("feedback")) {
					item.setFeedback(JSXaal.Util.getContentsAsText(contents[j]));
				}
			}
			if (solutionId && solutionId == child.readAttribute("id")) {
				q.setCorrectAnswer(item);
			}
			q.addAnswerOption(item);
		}
	}
	if (viewer.settings.isStoreQuestionAnswers()) {
		q.setXmlNode(node);
	}
	viewer.ui.showQuestion(q);
};
