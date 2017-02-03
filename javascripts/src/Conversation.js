function Conversation(view, analyser) {
    var self = this;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    var speechRecognitionList = new SpeechGrammarList();
    var recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 0;
    this.started = false;
    this.reset = true;
    this.words = null;
    var languagesSupported = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'en-NZ', 'en-ZA'];

    this.view = view;
    view.setupLanguages(languagesSupported);
    view.setConversation(this);


    recognition.onerror = function (event) {
        console.log('Speech recognition error detected: ' + event.error);
        alert("An error occured. Please Save the data and refresh the page.");
    };

    recognition.onend = function () {
        console.log('Speech recognition service disconnected');
        if (self.started) {
            recognition.start();
        }
    };

    var getGrammar = function (words) {
        return '#JSGF V1.0; grammar interest_words; public <interest_words> = ' + words.join(' | ') + ' ;';
    };

    this.restart = function (words) {
        words = words || this.words;
        self.stopRecognition();
        setTimeout(function () {
            self.startRecognition(words);
        }, 1000);
    };

    this.startRecognition = function (words) {
        this.words = words;
        recognition.lang = view.getLang();
        speechRecognitionList.addFromString(getGrammar(words), 1);
        recognition.grammars = speechRecognitionList;
        self.started = true;
        recognition.start();
    };

    this.stopRecognition = function () {
        self.started = false;
        recognition.stop();
    };

    var dataItem = {};
    recognition.onresult = function (event) {
        var last = event.results.length - 1;
        var lastSentence = event.results[last][0].transcript;
        var displayedOnScreen = view.isClear();
        view.checkWords(lastSentence, self.reset);
        if (event.results[last].isFinal) {
            var resultVal = view.getMatchedWords(lastSentence);
            if (resultVal.identified) {
                var date = new Date(event.timeStamp);
                dataItem.word1 = resultVal.word1 || "";
                dataItem.word2 = resultVal.word2 || "";
                dataItem.displayedOnScreen = displayedOnScreen ? 'true' : 'false';
                dataItem.sentence = lastSentence;
                dataItem.date = date.toGMTString();
                dataItem.timestamp = event.timeStamp;
                analyser.pushItem(dataItem);
                dataItem = {};
            }
            self.reset = true;
        }
    };

}

Conversation.prototype.hasStarted = function () {
    return this.started;
};

Conversation.prototype.setStartup = function () {
    this.view.setStartStop(this);
};