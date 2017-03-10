function Conversation(view, analyser) {
    var self = this;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    var speechRecognitionList = new SpeechGrammarList();
    var recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    this.started = false;
    this.reset = true;
    this.words = null;
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
        setTimeout(function () {
            self.restart(words);
        }, 30000);
    };

    this.stopRecognition = function () {
        self.started = false;
        recognition.stop();
    };

    var dataItem = {};

    function processResult(event) {
        var last = event.results.length - 1;
        var lastSentence = event.results[last][0].transcript;
        var displayedOnScreen = view.isClear();
        view.checkWords(lastSentence, self.reset);
        if (event.results[last].isFinal) {
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
            self.reset = true;
        }
    }

    recognition.onresult = function (event) {
        setTimeout(function () {
            processResult(event)
        }, 10);
    };

}

Conversation.prototype.hasStarted = function () {
    return this.started;
};

Conversation.prototype.setStartup = function () {
    this.view.setStartStop(this);
};