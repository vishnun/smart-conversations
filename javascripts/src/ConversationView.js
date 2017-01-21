function ConversationView() {
    var self = this;
    this.langSelectEl = $('.lang-select');
    this.langEl = $('.lang-select option:selected');
    var fullScreenEl = $('#full-screen');
    var saveCsvEl = $('#save-csv');
    var topicSelectEl = $('.topic-select');
    var wordContainer = $('.word-container');
    this.criticalWord1El = $('.critical-word-1');
    this.criticalWord2El = $('.critical-word-2');
    this.twoWordModeEl = $("#two-word-mode");
    this.startBtnEl = $('#start-btn');
    this.conversation;

    fullScreenEl.on('click', function() {
        if (wordContainer[0].webkitRequestFullscreen) {
            wordContainer[0].webkitRequestFullscreen();
        }
    });

    saveCsvEl.on('click', function() {
        analyser.saveCSV()
    });

    function setupTopics() {
        var topics = window.lcl.topics;
        for (topic in topics) {
            topicSelectEl.append('<option value="' + topic + '">' + topic + '</option>');
        }
    }

    function setupTwoWords() {
        self.twoWordModeEl.on('change', function(e) {
            if ($(this).prop("checked") == true) {
                self.criticalWord1El.removeClass('s12');
                self.criticalWord2El.removeClass('hide');
            } else {
                self.criticalWord1El.addClass('s12');
                self.criticalWord2El.addClass('hide');
            }
            self.focusOnWindow(this);
        });
    }

    function clearWords() {
        if (self.criticalWord1El.text() == '') {
            return;
        }
        self.criticalWord1El.text('');
        self.criticalWord2El.text('');
        self.conversation.reset = false;
    }

    $(window).keyup(function(evt) {
        evt = evt || window.event;
        var space = '32';
        if (evt.keyCode == space) {
            clearWords();
        }
    });

    setupTopics();
    setupTwoWords();
}

ConversationView.prototype.checkWords = function(sentence, reset) {
    var words = this.getWords();
    var returnVal = {}
    var word, previousWord;
    var mode = this.getWordsMode();
    for (var index in words) {
        word = words[index];
        if (sentence.indexOf(word) != -1 && reset) {
            if (this.criticalWord1El.text() == '') {
                this.criticalWord1El.text(word);
                returnVal.word1 = word;
                previousWord = word;
                returnVal.identified = true;
            } else if (mode && this.criticalWord2El.text() == '' && word !== previousWord && reset == true) {
                this.criticalWord2El.text(word);
                returnVal.word2 = word;
                returnVal.identified = true;
                break;
            }
        }
    }
    return returnVal;
};

ConversationView.prototype.getWordsMode = function() {
    return this.twoWordModeEl.prop("checked");
};

ConversationView.prototype.initMaterialSelect = function() {
    $('select').material_select();
};

ConversationView.prototype.setupLanguages = function(languagesSupported) {
    this.langSelectEl.html('');
    var self = this;
    languagesSupported.forEach(function(lang, index) {
        self.langSelectEl.append('<option value="' + lang + '">' + lang + '</option>');
    });

    this.initMaterialSelect();
};

ConversationView.prototype.getWords = function() {
    var selectedTopicEl = $('.topic-select option:selected');
    var selectedTopic = selectedTopicEl.val();
    return window.lcl.topics[selectedTopic];
};

ConversationView.prototype.getLang = function() {
    return this.langEl.text();
};

ConversationView.prototype.focusOnWindow = function(el) {
    $(el).blur();
    $(window).focus();
};

ConversationView.prototype.setConversation = function(conversation) {
    this.conversation = conversation;
};

ConversationView.prototype.setStartStop = function() {
    var self = this;
    this.startBtnEl.on('click', function(e) {
        if (self.conversation.hasStarted()) {
            self.conversation.stopRecognition();
            $(this).find('.text').text("Start");
        } else {
            self.conversation.startRecognition(self.getWords());
            $(this).find('.text').text("Stop");
        }
        self.focusOnWindow(this);
    });
};