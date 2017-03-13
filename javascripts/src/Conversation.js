function Conversation(view, analyser) {
    var self = this;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    var speechRecognitionList = new SpeechGrammarList();
    var recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    this.started = false;
    this.words = null;
    this.timeoutObj = null;
    var languagesSupported = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'en-NZ', 'en-ZA'];

    this.view = view;
    view.setupLanguages(languagesSupported);
    view.setConversation(this);


    recognition.onerror = function (event) {
        console.log('Speech recognition error detected: ' + event.error);
        if (event.error == "network") alert("An error occurred. Please Save the data and refresh the page.");
        self.restart(self.words);
    };

    recognition.onend = function () {
        console.log('Speech recognition service disconnected');
        if (self.started) {
            console.log("connecting again..");
            self.restart(self.words);
        }
    };

    var getGrammar = function (words) {
        return '#JSGF V1.0; grammar interest_words; public <interest_words> = ' + words.join(' | ') + ' ;';
    };

    this.restart = function (words) {
        console.log("restarting...");
        words = words || this.words;
        self.stopRecognition();
        setTimeout(function () {
            self.startRecognition(words);
        }, 1000);
    };

    this.startRecognition = function (words) {
        this.words = words;
        recognition.lang = view.getLang();
        // speechRecognitionList.addFromString(getGrammar(words), 1);
        // recognition.grammars = speechRecognitionList;
        self.started = true;
        recognition.start();
        self.timeoutObj = setTimeout(function () {
            self.restart(words);
        }, 15000);
    };

    this.stopRecognition = function () {
        self.started = false;
        clearTimeout(this.timeoutObj);
        recognition.stop();
    };

    var dataItem = {};

    function processResult(event) {
        var last = event.results.length - 1;
        var lastSentence = event.results[last][0].transcript;
        var displayedOnScreen = view.isClear();
        if (event.results[last].isFinal) {
            view.checkWords(lastSentence);
            view.addToTranscript(lastSentence);
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
        }
    }

    recognition.onresult = function (event) {
        processResult(event);
    };

}

Conversation.prototype.hasStarted = function () {
    return this.started;
};

Conversation.prototype.setStartup = function () {
    this.view.setStartStop(this);
};