/** @file jsxaal-ui.js*/
JSXaal.UI = Class.create({
    initialize: function(elementId, viewer) {
        this.viewer = viewer;
        this.elemId = elementId;
        this.drawingId = elementId + "-drawing";
        this.createDrawingPanel();
        if (this.viewer.settings.isShowNarrative())
            this.createNarrativePanel();
        if (this.viewer.settings.isSettingsPanel())
            this.createSettingsPanel();
    },
    /**
     * @function {private void} ?
     */
    createNarrativePanel: function() {
        var elem = new Element("div", {id: this.elemId + "-narrative"});
        elem.addClassName("jsxaal-narrative");
        $(this.elemId).appendChild(elem);
        this.narrativeElem = elem;
    },
    /**
     * @function {private void} ?
     */
    createDrawingPanel: function() {
        var elem = new Element("div", {id: this.drawingId});
        elem.addClassName("jsxaal-drawing");
        $(this.elemId).appendChild(elem);
    },
    /**
     * @function {public void} ?
     * @param {Object} text
     */
    setNarrative: function(text) {
        if (!this.viewer.settings.isShowNarrative())
            return;
        if (!this.narrativeElem)
            this.createNarrativePanel();
        this.narrativeElem.update(text);
    },
    /**
     * @function {private void} ?
     */
    createSettingsPanel: function() {
        var elem = new Element("div", {id: this.elemId + "-settings"});
        elem.addClassName("jsxaal-settings");
        var form = new Element("form");
        elem.appendChild(form);
        form.appendChild(this._createCheckBoxElement(this.viewer.settings.isSmoothAnimation(), 'SmoothAnimation', 
        		'smooth animation'));
        var label = new Element("label");
        label.setAttribute('for', this.viewer.id + '-' + 'SmoothAnimation');
        label.appendChild(document.createTextNode(' smooth animation'));
        form.appendChild(label);
        this.viewer.toolbar.commands.each(function (item) {
            form.appendChild(item.value.create());
        });
        $(this.elemId).appendChild(elem);
    },
    /**
     * @function {private Element} ?
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
     * @function {private void} ?
     * @param {Object} q
     */
    showQuestion: function(q) {
        var elem = $('jsxaal-interaction');
        if (!elem) {
            elem = new Element("div", {id: "jsxaal-interaction"});
            $$('body')[0].appendChild(elem);
        }
        elem.innerHTML = "";
        var shutter = $('shutter');
        if (!shutter) {
            shutter = new Element("div", {id: "shutter"});
            $$('body')[0].appendChild(shutter);
        }
        shutter.stopObserving('click');
        var question = new Element('div');
        question.update(q.getQuestionText());
        elem.appendChild(question);
        var form = new Element('form', {id: q.getId() + "-form"});
        elem.appendChild(form);
        var count = 0;
        q.getChoicesElements().each(function(item) {
            form.appendChild(item);
            if (count % 2 == 1) {
                form.appendChild(new Element("br"));
            }
            count++;

        });
        var answer = new Element('input', {type: "hidden", id: q.getId() + "-answer"});
        form.appendChild(answer);
        var butt = new Element('input', {id: q.getId() + "answerButton", type: "button", name: "answer", value: "Answer"});
        butt.observe('click', function(e){ this.answerQuestion(q);}.bind(this));
        form.appendChild(butt);
        elem.style.display = 'inline';
        shutter.style.display='inline';
    },
    /**
     * @function {private void} ?
     * @param {Object} q
     */
    answerQuestion: function(q) {
        var answer = $(q.getId() + "-answer").value; 
        q.setAnswer(answer);
        var clazz = "jsxaal-correct";
        if (!q.isCorrect()) {
            clazz = "jsxaal-wrong";
        }
        var feedback = new Element('div');
        feedback.addClassName(clazz);
        if (q.isCorrect() && !(q instanceof JSXaal.Question.Select)) {
            feedback.innerHTML = "Correct!";
        } else if (!(q instanceof JSXaal.Question.Select)){
            feedback.innerHTML = "Wrong";
        } else {
            feedback.innerHTML = "Grade: " + q.getGrade();
        }
        var closeButt = new Element('input', {type: "button", name: "submit", value: "Close"});
        closeButt.observe('click', function(evt) {this.closeQuestion(q);}.bind(this));
        if (q.viewer.settings.isStoreQuestionAnswers()) {
            var answerElem = new Element('student-answer', {answer: q.getAnswer()});
            q.getXmlNode().appendChild(answerElem);
            if (q.viewer.getServerInterface()) {
                q.viewer.getServerInterface().questionAnswered(q);              
            }
        }
        $('shutter').observe('click', function(evt) {this.closeQuestion(q);}.bind(this));
        var form = $(q.getId() + "-form");
        form.removeChild(form.lastChild);
        form.appendChild(feedback);
        form.appendChild(closeButt);
    },
    /**
     * @function {private void} ?
     * @param {Object} q
     */
    closeQuestion: function(q) {
        $('shutter').hide();
        $('jsxaal-interaction').hide();
        q.viewer.toolManager.setTool(null);
    }
});

JSXaal.UI.Toolbar = Class.create({
    /**
     * Constructor
     * @function {public void} JSXaal.UI.Toolbar
     * @param {Object} viewer
     */
    initialize: function(viewer) {
        this.viewer = viewer;
        this.commands = new Hash();
        this.created = false;
    },
    /**
    * @function {public void} ?
    * @param {Object} viewer
    */
    create: function() {
        this.commands.each(function(item) {
            item.value.create();
        });
        this.created = true;
    },
    /**
     * @function {public void} ?
     * @param {Object} name
     * @param {Object} obj
     */
    addCommand: function(name, obj) {
        this.commands.set(name, obj);
        if (this.created) {
            this.create();
        }
    }
});