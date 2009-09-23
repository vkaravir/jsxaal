/**
 * @namespace JSXaal.Question
 */
JSXaal.Question = new Object();
/**
 * An abstract superclass of all questions in JSXaal.
 * @class {abstract} JSXaal.Question.AbstractQuestion
 */
JSXaal.Question.AbstractQuestion = Class.create({
	initialize: function(id, viewer, qType) {
		this.displayed = false;
		this.qquestionType = qType;
		this.id = id;
		this.viewer = viewer;
	},
	isDisplayed: function(){
		return this.displayed;
	},
	setDisplayed: function(){
		this.displayed = true;
	},
	getQuestionType: function() {
		return this.questionType;
	},
	setCorrectAnswer: function(correct) {
		this.correct = correct;
	},
	setAnswer: function(answer) {
		this.answer = answer;
	},
	getAnswer: function() {
		return this.answer;
	},
	isCorrect: function() {
		if (!this.answer) {
			return false;
		} else {
			debug("ERROR: Unimplemented method JSXaal.Question.AbstractQuestion.isCorrect")
		}
	},
	isCorrectAnswer: function(answer) {
		this.setAnswer(answer);
		return this.isCorrect();
	},
	setQuestionText: function(question) {
		this.question = question;
	},
	getQuestionText: function() {
		return this.question;
	},
	getId: function() {
		return this.id;
	},
	addAnswerOption: function(item) {
		console.log("ERROR: Unimplemented method JSXaal.Question.AbstractQuestion.addAnswerOption");
	},
	getChoicesElements: function() {
		console.log("ERROR: Unimplemented method JSXaal.Question.AbstractQuestion.getChoicesElements");
	},
	setXmlNode: function(node) {
		this.xmlnode = node;
	},
	getXmlNode: function() {
		return this.xmlnode;
	}
});
JSXaal.Question.Item = Class.create({
	initialize: function(id) {
		this.id = id;
	},
	setAnswer: function(answer) {
		this.answer = answer;
	},
	getAnswer: function() {
		return this.answer;
	},
	setFeedback: function(feedback) {
		this.feedback = feedback;
	},
	getFeedback: function() {
		return this.feedback;
	},
	getId: function() {
		return this.id;
	},
	setGrade: function(value) {
		this.grade = Number(value);
	},
	getGrade: function() {
		return this.grade;
	}
});
/**
 * A question where one of the given choices can be selected.
 * @class JSXaal.Question.SelectOne @extends JSXaal.Question.AbstractQuestion
 */
JSXaal.Question.SelectOne = Class.create(JSXaal.Question.AbstractQuestion, {
	initialize: function($super, id, viewer){
		$super(id, viewer, "select-one");
		this.options = new Array();
	},
	addAnswerOption: function(item) {
		this.options.push(item);
	},
	isCorrect: function() {
		return (this.answer == this.correct.getId());
	},
	getChoicesElements: function() {
		var elems = new Array();
		for (var index = 0, len = this.options.length; index < len; ++index) {
 			var item = this.options[index];
			elems[2*index] = new Element('input', {type: "radio", name: this.getId() + "group", value:"true", onclick: "$('" + this.getId() + "-answer').value='"+item.getId()+"';"});
			elems[2*index+1] = new Element('span');
			elems[2*index+1].innerHTML = item.getAnswer();
		}
		return elems;
	}
});
/**
 * A question where any number of the given choices can be selected.
 * @class JSXaal.Question.Select @extends JSXaal.Question.AbstractQuestion
 */
JSXaal.Question.Select = Class.create(JSXaal.Question.AbstractQuestion, {
	initialize: function($super, id, viewer){
		$super(id, viewer, "select");
		this.options = new Array();
	},
	addAnswerOption: function(item) {
		this.options.push(item);
	},
	isCorrect: function() {
		return (this.getGrade() > 0);
	},
	getChoicesElements: function() {
		var elems = new Array();
		for (var index = 0, len = this.options.length; index < len; ++index) {
 			var item = this.options[index];
			elems[2*index] = new Element('input', {type: "checkbox", id: this.getId() + item.getId(), name: this.getId() + "group"});
			elems[2*index+1] = new Element('span');
			elems[2*index+1].innerHTML = item.getAnswer();
		}
		return elems;
	},
	getAnswer: function() {
		var answer = "";
		for (var index = 0, len = this.options.length; index < len; ++index) {
 			var item = this.options[index];
			var itemElem = $(this.getId() + item.getId());
			if (itemElem.checked) {
				answer += " " + item.getId();
			}
		}
		return answer;
	},
	getGrade: function() {
		var grade = 0;
		for (var index = 0, len = this.options.length; index < len; ++index) {
 			var item = this.options[index];
			var itemElem = $(this.getId() + item.getId());
			if (itemElem.checked) {
				grade += item.getGrade();
			}
		}
		return grade;
	}
});