$(function() {
    function init() {
        var started = false,
            reset = false;
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
        var criticalWord = $('.critical-word');
        var wordContainer = $('.word-container');
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

        $(window).keyup(function(evt) {
            evt = evt || window.event;
            // If Space
            if (evt.keyCode == '32') {
                criticalWord.text('');
                reset = true;
            }
        });

        $('#start-btn').on('click', function(e) {
            if (started) {
                started = false;
                recognition.stop();
                $(this).find('.text').text("Start");
            } else {
                started = true;
                recognition.start();
                $(this).find('.text').text("Stop");
            }
            $(this).blur();
            $(window).focus();
        });

        $('#full-screen').on('click', function() {
            if (wordContainer[0].webkitRequestFullscreen) {
                wordContainer[0].webkitRequestFullscreen();
            }
        });

        recognition.onresult = function(event) {
            var last = event.results.length - 1;
            var lastSentence = event.results[last][0].transcript;
            interest_words.forEach(function(element, index) {
                if (lastSentence.indexOf(element) != -1) {
                    if (criticalWord.text() == '' && reset == false) {
                        criticalWord.text(element);
                    }
                }
            });
            if (event.results[last].isFinal) {
                reset = false;
            }
        }
    }
    init();

});