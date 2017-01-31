function ConversationView(analyser) {
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
    this.conversation = null;
    this.previousWord = "";

    fullScreenEl.on('click', function () {
        if (wordContainer[0].webkitRequestFullscreen) {
            wordContainer[0].webkitRequestFullscreen();
        }
    });

    saveCsvEl.on('click', function () {
        var csvContent = analyser.getCSV();
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
    });

    function setupTopics() {
        var topics = window.lcl.topics;
        for (topic in topics) {
            topicSelectEl.append('<option value="' + topic + '">' + topic + '</option>');
        }
    }

    function setupTwoWords() {
        self.twoWordModeEl.on('change', function (e) {
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

    this.setAutoClear = function (timeout) {
        setTimeout(function () {
            clearWords();
        }, timeout);
    };

    setupTopics();
    setupTwoWords();
}

ConversationView.prototype.getMatchedWords = function (sentence) {
    var words = this.getWords();
    var returnVal = {};
    for (var index in words) {
        word = words[index];
        if (sentence.indexOf(word) != -1) {
            if (!returnVal.word1 || returnVal.word1 == '') {
                returnVal.word1 = word;
            } else {
                returnVal.word2 = word;
            }
            returnVal.identified = true;
        }
    }
    return returnVal;
};

ConversationView.prototype.checkWords = function (sentence, reset) {
    var words = this.getWords();
    var returnVal = {};
    var timeout = 10000;
    var word;
    var mode = this.isTwoWordsMode();
    for (var index in words) {
        word = words[index];
        if (sentence.indexOf(word) != -1 && reset) {
            if (this.criticalWord1El.text() == '') {
                this.criticalWord1El.text(word);
                returnVal.word1 = word;
                this.previousWord = word;
                returnVal.identified = true;
                if (!this.isTwoWordsMode()) {
                    this.setAutoClear(timeout);
                }
            } else if (mode && this.criticalWord2El.text() == '' && word !== this.previousWord && reset == true) {
                this.criticalWord2El.text(word);
                returnVal.word2 = word;
                returnVal.identified = true;
                this.setAutoClear(timeout);
                break;
            }
        }
    }
    return returnVal;
};

ConversationView.prototype.isTwoWordsMode = function () {
    return this.twoWordModeEl.prop("checked");
};

ConversationView.prototype.initMaterialSelect = function () {
    $('select').material_select();
};

ConversationView.prototype.setupLanguages = function (languagesSupported) {
    this.langSelectEl.html('');
    var self = this;
    languagesSupported.forEach(function (lang, index) {
        self.langSelectEl.append('<option value="' + lang + '">' + lang + '</option>');
    });

    this.initMaterialSelect();
};

ConversationView.prototype.getWords = function () {
    var selectedTopicEl = $('.topic-select option:selected');
    var selectedTopic = selectedTopicEl.val();
    return window.lcl.topics[selectedTopic];
};

ConversationView.prototype.getLang = function () {
    return this.langEl.text();
};

ConversationView.prototype.focusOnWindow = function (el) {
    $(el).blur();
    $(window).focus();
};

ConversationView.prototype.setConversation = function (conversation) {
    this.conversation = conversation;
};

ConversationView.prototype.setStartStop = function () {
    var self = this;
    this.startBtnEl.on('click', function (e) {
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