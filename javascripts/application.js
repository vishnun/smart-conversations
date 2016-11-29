$(function() {

    function getLang() {
        return $('.lang-select option:selected').text();
    }

    function initSelect() {
        $('select').material_select();
    }

    function setupLanguages(langs) {
        $('.lang-select').html('');
        langs.forEach(function(lang, index) {
            $('.lang-select').append('<option value="' + lang + '">' + lang + '</option>');
        });
    }

    function setupTopics() {
        var topics = window.lcl.topics,
            topicSelect = $('.topic-select');
        for (topic in topics) {
            topicSelect.append('<option value="' + topic + '">' + topic + '</option>');
        }
    }

    function getInterestWords() {
        var selectedTopic = $('.topic-select option:selected').val();
        return window.lcl.topics[selectedTopic];
    }

    function getGrammar() {
        var interestWords = getInterestWords();
        return '#JSGF V1.0; grammar interest_words; public <interest_words> = ' + interestWords.join(' | ') + ' ;';
    }

    function init() {
        var started = false,
            reset = false;
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
        var criticalWord = $('.critical-word');
        var wordContainer = $('.word-container');

        var languages_supported = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'en-NZ', 'en-ZA'];


        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 2;

        recognition.onresult = function(event) {
            var last = event.results.length - 1;
            var lastSentence = event.results[last][0].transcript;
            getInterestWords().forEach(function(element, index) {
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

        $(window).keyup(function(evt) {
            evt = evt || window.event;
            var space = '32';
            if (evt.keyCode == space) {
                criticalWord.text('');
                reset = true;
            }
        });

        $('#start-btn').on('click', function(e) {
            recognition.lang = getLang();
            var grammar = getGrammar();
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;

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

        setupTopics();
        setupLanguages(languages_supported);
        initSelect();
    }

    init();
});