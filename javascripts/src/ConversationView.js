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
    this.timeoutEl = $("#clear-timeout");
    this.startBtnEl = $('#start-btn');
    this.conversation = null;
    this.previousWord = "";
    this.timeout_obj = null;
    this.transcriptEl = $("#transcript");
    this.selectedWords = null;
    var clearTranscriptEl = $(".clear-transcript");

    clearTranscriptEl.on('click', function (e) {
       $("#transcript").text("");
       e.stopPropagation();
    });

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
        topicSelectEl.on('change', function () {
            self.conversation.restart(self.getWords());
        });
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
    }

    this.setAutoClear = function (timeout) {
        var timeout_obj = setTimeout(function () {
            clearWords();
        }, timeout);
        return timeout_obj;
    };

    setupTopics();
    setupTwoWords();
}

ConversationView.prototype.addToTranscript = function (sentence) {
    this.transcriptEl.append(sentence + " - ");
};

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

ConversationView.prototype.isClear = function () {
    return this.criticalWord1El.text() == "";
};

ConversationView.prototype.getTimeout = function () {
    return this.timeoutEl.val() * 1000;
};
ConversationView.prototype.checkWords = function (sentence) {
    var words = this.getWords();
    var returnVal = {};
    var timeout = this.getTimeout();
    var word;
    var mode = this.isTwoWordsMode();
    for (var index in words) {
        word = words[index];
        if (sentence.indexOf(word) != -1) {
            if (this.criticalWord1El.text() == '') {
                this.criticalWord1El.text(word);
                returnVal.word1 = word;
                this.previousWord = word;
                returnVal.identified = true;
                this.timeout_obj = this.setAutoClear(timeout);
            } else if (mode && this.criticalWord2El.text() == '' && word !== this.previousWord) {
                this.criticalWord2El.text(word);
                returnVal.word2 = word;
                returnVal.identified = true;
                clearTimeout(this.timeout_obj);
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
    if (this.selectedWords) {
        return this.selectedWords;
    }
    var selectedTopicEl = $('.topic-select option:selected');
    var selectedTopic = selectedTopicEl.val();
    this.selectedWords = window.lcl.topics[selectedTopic];
    return this.selectedWords;
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
    var stopBtnClass = "red lighten-2";
    this.startBtnEl.on('click', function (e) {
        if (self.conversation.hasStarted()) {
            self.conversation.stopRecognition();
            $(this).find('.text').text("Start");
            $(this).removeClass(stopBtnClass);
        } else {
            self.conversation.startRecognition(self.getWords());
            $(this).find('.text').text("Stop");
            $(this).addClass(stopBtnClass);
        }
        self.focusOnWindow(this);
    });
};