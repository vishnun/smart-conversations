$(function() {
    var started = true;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    var criticalWord = $('.critical-word');
    var interest_words = ['hello', 'hi', 'morning', 'afternoon', 'evening'];

    var grammar = '#JSGF V1.0; grammar interest_words; public <interest_words> = ' + interest_words.join(' | ') + ' ;';

    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();

    recognition.continuous = true;
    speechRecognitionList.addFromString(grammar, 1);

    recognition.grammars = speechRecognitionList;
    //recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 2;

    $('#start-btn').on('click', function(e) {
        if (started) {
            started = false;
            recognition.stop();
        } else {
            started = true;
            recognition.start();
        }
    });

    recognition.onresult = function(event) {
        var last = event.results.length - 1;
        var lastSentence = event.results[last][0].transcript;
        interest_words.forEach(function(element, index) {
            if (lastSentence.indexOf(element) != -1) {
                criticalWord.text(element);
            }
        });
    }

});